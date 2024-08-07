// src/app/api/getcredentials/route.js
import { admin } from '@/app/lib/firebase';

const VALIDATION_KEY = process.env.VALIDATION_KEY;

export async function GET(req) {
  try {
    // Ambil query parameter dari URL 
    const url = new URL(req.url, process.env.NEXT_PUBLIC_API_BASE_URL);  // Tambahkan base URL jika diperlukan
    const key = url.searchParams.get('key');

    // Validasi key
    if (key !== VALIDATION_KEY) {
      return new Response(JSON.stringify({ error: 'Invalid key' }), { status: 403 });
    }

    // Ambil referensi ke database
    const ref = admin.database().ref('credentials');

    // Ambil semua data kredensial
    const snapshot = await ref.orderByChild('hit').once('value');

    if (!snapshot.exists()) {
      return new Response(JSON.stringify({ error: 'No credentials found' }), { status: 404 });
    }

    // Ambil data dan urutkan berdasarkan 'hit'
    const credentials = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      credentials.push({
        ...data,
        id: childSnapshot.key  // Simpan key Firebase untuk update
      });
    });

    // Urutkan data berdasarkan 'hit' dan ambil yang pertama
    credentials.sort((a, b) => a.hit - b.hit);
    const lowestHitCredential = credentials[0];

    // Update nilai 'hit' di Firebase
    if (lowestHitCredential) {
      const updateRef = ref.child(lowestHitCredential.id);
      await updateRef.update({ hit: lowestHitCredential.hit + 1 });
    }

    // Kembalikan data
    return new Response(JSON.stringify(lowestHitCredential), { status: 200 });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch credentials' }), { status: 500 });
  }
}
