import { admin } from '@/app/lib/firebase';

const contentRef = admin.database().ref('content'); // Ganti 'content' dengan nama koleksi/refs yang sesuai

export async function GET() {
  try {
    console.log('Fetching data from Firebase...');
    const snapshot = await contentRef.once('value');
    const data = snapshot.val();
    console.log('Data fetched from Firebase:', data);

    // Ubah data dari objek ke array
    let contentArray = [];
    if (data && typeof data === 'object') {
      contentArray = Object.values(data);
    } else {
      console.error('Data from DB is not in expected format:', data);
    }

    return new Response(
      JSON.stringify(contentArray),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
