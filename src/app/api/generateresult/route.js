import fetch from 'node-fetch';
import { admin } from '@/app/lib/firebase';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const trendsRef = admin.database().ref('trends');

async function fetchTrendsFromAPI() {
  const response = await fetch(`${BASE_URL}/api/trends`);
  if (!response.ok) {
    throw new Error('Failed to fetch trends from API');
  }
  return response.json();
}

async function fetchTrendsFromDB() {
  const snapshot = await trendsRef.once('value');
  const data = snapshot.val() || [];
  if (!Array.isArray(data)) {
    console.error('Data from DB is not an array:', data);
    return [];
  }
  return data;
}

async function updateTrendsInDB(trends) {
  await trendsRef.set(trends);
}

async function querySearchAPI(query) {
  try {
    const response = await fetch(`${BASE_URL}/api/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Failed to query search API with query: ${query}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error in querySearchAPI:', error);
    throw error;
  }
}

export async function generateResult() {
  try {
    const apiTrends = await fetchTrendsFromAPI();
    const dbTrends = await fetchTrendsFromDB();
    const usedTitles = new Set(dbTrends.filter(trend => trend.used).map(trend => trend.title));
    
    for (const trend of apiTrends) {
      if (!usedTitles.has(trend.title)) {
        await querySearchAPI(trend.title);
        trend.used = true;
      }
    }

    await updateTrendsInDB(apiTrends);

    return { success: true, message: 'Trends processed successfully.' };
  } catch (error) {
    console.error('Error in generateResult:', error);
    return { success: false, message: error.message };
  }
}

export async function GET() {
  const result = await generateResult();
  return new Response(
    JSON.stringify(result),
    {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
