export async function fetchData() {
  const response = await fetch('/api/data'); // Endpoint yang telah dibuat
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}
