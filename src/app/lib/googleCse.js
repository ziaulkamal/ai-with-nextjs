// src/app/lib/getCredentials.js
const CREDENTIALS_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/getcredentials`;

export async function fetchCredentials() {
  try {
    const response = await fetch(`${CREDENTIALS_URL}?key=${process.env.VALIDATION_KEY}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch credentials: ${response.statusText}`);
    }
    
    const credentialData = await response.json();
    
    if (!credentialData || !credentialData.apiKey || !credentialData.cseId) {
      throw new Error('Invalid credential data');
    }

    return credentialData;
  } catch (error) {
    console.error('Error fetching credentials:', error);
    throw error;
  }
}
