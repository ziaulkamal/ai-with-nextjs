// src/app/lib/googleTrends.js
import GoogleTrends from 'google-trends-api';

/**
 * Mengambil data Google Trends terbaru.
 * @param {Object} options - Opsi untuk mengonfigurasi permintaan.
 * @returns {Promise<Object>} - Data Google Trends.
 */
export async function getLatestTrends(options = { geo: 'US', trendDate: new Date() }) {
  try {
    const trends = await GoogleTrends.dailyTrends({
      trendDate: options.trendDate,
      geo: options.geo,
    });

    return JSON.parse(trends);
  } catch (error) {
    throw new Error('Failed to fetch Google Trends data');
  }
}
