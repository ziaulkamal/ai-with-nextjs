import { getLatestTrends } from '@/app/lib/googleTrends';
import { admin } from '@/app/lib/firebase';

function sanitizeKey(key) {
  // Ganti karakter yang tidak valid dengan karakter yang valid
  return key.replace(/[\.\#\$\[\/\]\, ]/g, '_');
}

export async function GET(request) {
  try {
    const trends = await getLatestTrends();

    // Proses dan filter data di sini
    const trendItems = trends.default.trendingSearchesDays.map(day => day.trendingSearches.map(search => ({
      title: search.title.query,
      volume: search.formattedTraffic,
      used: false,
    })));

    // Rata-rata hasil data
    const filteredTrends = trendItems.flat();

    // Ambil referensi database Firebase
    const db = admin.database();
    const ref = db.ref('trends'); // Ganti 'trends' dengan nama koleksi/refs yang sesuai

    // Ambil data yang ada dari Firebase
    const existingDataSnapshot = await ref.once('value');
    const existingData = existingDataSnapshot.val();

    // Pastikan existingData adalah array
    const existingArrayData = Array.isArray(existingData) ? existingData : Object.values(existingData || {});

    console.log('Existing Data:', existingArrayData);

    // Buat objek untuk memeriksa apakah title sudah ada
    const existingTitles = new Set(existingArrayData.map(item => item.title));

    console.log('Existing Titles:', Array.from(existingTitles));

    // Filter data baru yang tidak ada di Firebase
    const newTrends = filteredTrends.filter(item => !existingTitles.has(item.title));

    console.log('New Trends:', newTrends);

    if (newTrends.length > 0) {
      // Tambahkan data baru ke Firebase dengan kunci yang telah dibersihkan
      const updates = newTrends.reduce((acc, item) => {
        const sanitizedTitle = sanitizeKey(item.title);
        acc[`/${sanitizedTitle}`] = item;
        return acc;
      }, {});
      await ref.update(updates);

      console.log('Data updated in Firebase:', updates);
    } else {
      console.log('No new trends to update.');
    }

    return new Response(JSON.stringify(filteredTrends), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
