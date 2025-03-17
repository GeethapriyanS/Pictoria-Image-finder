import React, { useState } from "react";

const SearchBar = ({ onSearch, recentSearches }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search photos and illustrations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>
      <div className="recent-searches">
        <strong>Recent Searches:</strong>
        {recentSearches.map((search, index) => (
          <button key={index} onClick={() => onSearch(search)}>
            {search}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
