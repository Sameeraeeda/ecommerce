import React, { useState, useEffect } from 'react';

const SearchHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getSearchHistory/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch search history');

        const data = await response.json();
        setHistory(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchHistory();
  }, [userId]);

  return (
    <div>
      <h2>Search History</h2>
      {error && <p>{error}</p>}
      {history.length === 0 ? (
        <p>No search history found.</p>
      ) : (
        <ul>
          {history.map((entry) => (
            <li key={entry._id}>
              {entry.searchQuery} - {new Date(entry.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchHistory;
