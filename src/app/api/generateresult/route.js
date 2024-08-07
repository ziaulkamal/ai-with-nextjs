import fetch from 'node-fetch';
import { admin } from '@/app/lib/firebase';
import { setTimeout } from 'timers/promises';

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

async function processTrends() {
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

    console.log('Trends processed successfully.');
  } catch (error) {
    console.error('Error in processTrends:', error);
  }
}

export async function GET() {
  // Start the processing in the background
  (async () => {
    processTrends().catch(error => console.error('Error in background processing:', error));
  })();

  // Respond immediately
  return new Response(
    JSON.stringify({ success: true, message: 'Queue Started' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
