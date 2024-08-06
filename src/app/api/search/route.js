// src/app/api/search/route.js
import { fetchCredentials } from '@/app/lib/googleCse';
import { admin } from '@/app/lib/firebase';

function getFirstWords(text, numWords) {
  // Hapus simbol selain titik dan koma
  const cleanedText = text.replace(/[^\w\s,.]/g, '');

  // Ambil 4 kata pertama
  const words = cleanedText.split(/\s+/);
  return words.slice(0, numWords).join(' ');
}

async function isTitleExists(title) {
  try {
    const ref = admin.database().ref('content');
    const snapshot = await ref.orderByChild('title').equalTo(title).once('value');
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking title existence:', error);
    return false;
  }
}

async function saveToFirebase(data) {
  try {
    const ref = admin.database().ref('content');
    await ref.push(data);
  } catch (error) {
    console.error('Error saving to Firebase:', error);
  }
}

export async function GET(req) {
  try {
    const credentials = await fetchCredentials();
    
    if (!credentials || !credentials.apiKey || !credentials.cseId) {
      return new Response(
        JSON.stringify({ error: 'Missing credentials data' }),
        { status: 500 }
      );
    }

    const { apiKey, cseId } = credentials;
    const query = new URL(req.url).searchParams.get('query');
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400 }
      );
    }

    // Buat URL pencarian Google Custom Search
    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cseId}`;
    const searchResponse = await fetch(searchUrl);
    // console.log(searchResponse);
    if (!searchResponse.ok) {
      throw new Error(`Search API request failed: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();

    // Ambil `title` dan `snippet` dari setiap item
    const results = searchData.items ? searchData.items : [];

    for (const item of results) {
      const title = getFirstWords(item.title, 4);
      const snippet = item.snippet;

      // Periksa apakah title sudah ada di Firebase
      if (!(await isTitleExists(title))) {
        // Tambahkan atribut `status` dengan nilai default `false`
        const dataToSave = { title, snippet, status: false };
        await saveToFirebase(dataToSave);
      }
    }

    return new Response(
      JSON.stringify({ message: 'Data processed successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error performing search:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to perform search' }),
      { status: 500 }
    );
  }
}