'use client';

import { useState } from 'react';

export default function SendToEndpointPage() {
  const [endpoint, setEndpoint] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get the current domain URL
  const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';

  // Function to handle data submission
  async function handleSubmit() {
    setMessage('');
    setIsLoading(true);

    try {
      // Validate the license key
      const licenseResponse = await fetch('/api/validate-key');
      const { license } = await licenseResponse.json();

      if (secretKey !== license) {
        setMessage('Invalid secret key');
        setIsLoading(false);
        return;
      }

      // Fetch data from existing API
      const dataResponse = await fetch('/api/data');
      if (!dataResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await dataResponse.json();

      // Format data
      const formattedData = data.map(item => ({
        keyword: formatTitle(item.title),
        url: currentDomain,
        status: false,
      }));

      // Send data to provided endpoint
      await sendDataOneByOne(formattedData, endpoint);

      setMessage('Data sent successfully');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }

    setIsLoading(false);
  }

  // Function to format title
  function formatTitle(title) {
    return title
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '-') // Replace emojis with -
      .replace(/-{2,}/g, '-')         // Replace -- with -
      .replace(/-$/, '');             // Remove trailing - from string
  }

  // Function to send data one by one
  async function sendDataOneByOne(dataArray, endpoint) {
    for (const data of dataArray) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to send data: ${await response.text()}`);
        }

        console.log(`Successfully sent data: ${data.keyword}`);
      } catch (error) {
        console.error(`Error sending data: ${error.message}`);
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Send Data to Endpoint</h1>
      <div className="mb-4">
        <label className="block mb-2 text-gray-700">Endpoint URL:</label>
        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full"
          placeholder="Enter the endpoint URL"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-gray-700">Secret Key:</label>
        <input
          type="text"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full"
          placeholder="f667b555-9b4d-43a0-b1e2-0d8843955bb4"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="p-2 bg-blue-500 text-white rounded"
        disabled={isLoading}
      >
        {isLoading ? 'Submitting...' : 'Submit Data'}
      </button>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
