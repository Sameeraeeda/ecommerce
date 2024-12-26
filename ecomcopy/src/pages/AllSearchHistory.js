import React, { useEffect, useState } from 'react';

const AllSearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/getAllSearchHistory');
        if (!response.ok) throw new Error('Failed to fetch search history');
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAllHistory();
  }, []);

  return (
    <div>
      <h2>All Search History</h2>
      {error && <p>{error}</p>}
      {history.length === 0 ? (
        <p>No search history found.</p>
      ) : (
        <ul>
          {history.map((entry) => (
            <li key={entry._id}>
              {entry.searchQuery} - {entry.userId ? `User ID: ${entry.userId}` : 'Anonymous'} -{' '}
              {new Date(entry.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllSearchHistory;
