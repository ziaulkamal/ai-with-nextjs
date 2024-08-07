'use client';

import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { AiOutlineWarning, AiOutlineCheckCircle } from 'react-icons/ai';

const POLL_INTERVAL = 5000; // Interval polling dalam milidetik (5 detik)
const PAGE_SIZE = 10; // Jumlah item per halaman

export default function HomePage() {
  const [content, setContent] = useState([]);
  const [error, setError] = useState(null);

  // Fetch data dari API
  async function fetchData() {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      // Urutkan data berdasarkan status
      const sortedData = data.sort((a, b) => a.status - b.status);
      setContent(sortedData);
    } catch (error) {
      setError(error.message);
    }
  }

  // Gunakan efek untuk polling data secara berkala
  useEffect(() => {
    fetchData(); // Ambil data saat pertama kali dimuat

    const intervalId = setInterval(() => {
      fetchData(); // Ambil data setiap beberapa detik
    }, POLL_INTERVAL);

    // Hapus interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, []);

  if (error) return <div>Error: {error}</div>;

  // Define columns for DataTable
  const columns = [
    {
      name: 'Title',
      selector: row => row.title,
      sortable: true,
    },
    {
      name: 'Snippet',
      selector: row => row.snippet,
      sortable: true,
    },
    {
      name: 'Status',
      cell: row => (
        row.status ? (
          <AiOutlineCheckCircle className="text-green-500" title="Success" />
        ) : (
          <AiOutlineWarning className="text-red-500" title="Warning" />
        )
      ),
      sortable: true,
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content List</h1>
      <DataTable
        columns={columns}
        data={content}
        pagination
        paginationPerPage={PAGE_SIZE}
        paginationRowsPerPageOptions={[PAGE_SIZE]}
        highlightOnHover
        striped
        noDataComponent="No data available"
      />
    </div>
  );
}
