'use client'; // Menandai file ini sebagai komponen client

import { useEffect, useState } from 'react';
import { fetchData } from '@/app/lib/api'; // Pastikan path ini benar

export default function HomePage() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDataFromAPI() {
      try {
        const response = await fetchData();
        setData(response);
      } catch (error) {
        setError('Failed to fetch data');
        console.error('Failed to fetch data:', error);
      }
    }

    fetchDataFromAPI();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Realtime Data</h1>
      {error && <p className="text-red-500">{error}</p>}
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border-b px-4 py-2">Title</th>
            <th className="border-b px-4 py-2">Snippet</th>
            <th className="border-b px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="border-b px-4 py-2">{item.title}</td>
              <td className="border-b px-4 py-2">{item.snippet}</td>
              <td className="border-b px-4 py-2">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
