'use client';

import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { AiOutlineWarning, AiOutlineCheckCircle } from 'react-icons/ai';
import Link from 'next/link'; // Import Link from next

const POLL_INTERVAL = 5000; // Interval polling dalam milidetik (5 detik)
const DEFAULT_PAGE_SIZE = 10; // Jumlah item per halaman default

export default function HomePage() {
  const [content, setContent] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE); // State untuk menyimpan jumlah item per halaman
  const [expandedRows, setExpandedRows] = useState([]); // State untuk menyimpan baris yang diperluas

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
      cell: row => <div className="text-gray-800">{row.title}</div>,
    },
    {
      name: 'Snippet',
      selector: row => row.snippet,
      sortable: true,
      cell: row => <div className="text-gray-600">{row.snippet}</div>,
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

  // Expandable row component
  const ExpandedComponent = ({ data }) => (
    <div className="p-4 bg-gray-100 border-t border-gray-300">
      <p><strong>Title:</strong> {data.title}</p>
      <p><strong>Snippet:</strong> {data.snippet}</p>
      <p><strong>Status:</strong> {data.status ? 'Success' : 'Warning'}</p>
    </div>
  );

  return (
    <div className="relative">
      {/* Background animation */}
      <div className="bg-animated-gradient absolute inset-0 -z-10"></div>
      <div className="container mx-auto p-4 h-screen relative z-10">
        <h1 className="text-2xl font-bold mb-4 text-white">Content List</h1>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-white">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="p-2 rounded border border-gray-300 bg-white text-gray-700"
            >
              {[10, 25, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          {/* Add a button to navigate to Send-to-Endpoint page */}
          <Link
            href="/send-to-endpoint"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send Data to Endpoint
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={content}
          pagination
          paginationPerPage={pageSize}
          paginationRowsPerPageOptions={[10, 25, 50]}
          expandableRows
          expandableRowsComponent={ExpandedComponent}
          expandableRowExpanded={row => expandedRows.includes(row.id)}
          onRowExpandToggled={row => {
            setExpandedRows(prev =>
              prev.includes(row.id) ? prev.filter(id => id !== row.id) : [...prev, row.id]
            );
          }}
          highlightOnHover
          striped
          noDataComponent="No data available"
          className="text-gray-800"
          customStyles={{
            rows: {
              style: {
                minHeight: '72px', // Set height of rows
              },
            },
            headCells: {
              style: {
                paddingLeft: '8px', // Add padding to head cells
                paddingRight: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#f3f4f6', // Light background for header
              },
            },
            cells: {
              style: {
                paddingLeft: '8px', // Add padding to cells
                paddingRight: '8px',
                fontSize: '14px',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
