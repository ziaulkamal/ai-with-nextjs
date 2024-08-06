// src/app/api/trends/route.js
import { getLatestTrends } from '@/app/lib/googleTrends';

export async function GET(request) {
  try {
    const trends = await getLatestTrends();
    return new Response(JSON.stringify(trends), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
