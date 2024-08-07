import cron from 'node-cron';
import fetch from 'node-fetch';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

async function processTrends() {
  try {
    const response = await fetch(`${BASE_URL}/api/trends`);
    if (!response.ok) {
      throw new Error('Failed to fetch trends from API');
    }
    const apiTrends = await response.json();

    if (!Array.isArray(apiTrends)) {
      console.error('API trends data is not an array:', apiTrends);
      return;
    }

    const dbTrends = await fetchTrendsFromDB();
    if (!Array.isArray(dbTrends)) {
      console.error('DB trends data is not an array:', dbTrends);
      return;
    }

    const usedTitles = new Set(dbTrends.filter(trend => trend.used).map(trend => trend.title));
    
    for (const trend of apiTrends) {
      if (!usedTitles.has(trend.title)) {
        await querySearchAPI(trend.title);
        trend.used = true;
      }
    }

    await updateTrendsInDB(apiTrends);
  } catch (error) {
    console.error('Error in processTrends:', error);
  }
}

cron.schedule('0 1 * * *', () => {
  console.log('Running processTrends job...');
  processTrends().catch(error => console.error('Error in cron job:', error));
});
