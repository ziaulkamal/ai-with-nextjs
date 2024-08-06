// src/app/api/save-credential/route.js
import { admin } from '@/app/lib/firebase';

export async function POST(req) {
  try {
    const { credentials } = await req.json();

    if (!credentials || !credentials.account || !credentials.apiKey || !credentials.cseId) {
      return new Response(
        JSON.stringify({ error: 'Credentials must include account, apiKey, and cseId' }),
        { status: 400 }
      );
    }

    const ref = admin.database().ref('credentials');
    const snapshot = await ref.orderByChild('account').equalTo(credentials.account).once('value');
    
    if (snapshot.exists()) {
      return new Response(
        JSON.stringify({ error: 'Credentials with this account already exists' }),
        { status: 400 }
      );
    }

    const credentialWithHit = {
      ...credentials,
      hit: 0,
    };

    await ref.push(credentialWithHit);

    return new Response(
      JSON.stringify({ message: 'Credentials saved successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving credentials:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save credentials' }),
      { status: 500 }
    );
  }
}
