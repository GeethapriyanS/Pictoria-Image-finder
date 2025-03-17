import React from "react";

const TrendingSearches = ({ trending, onSearch }) => {
  return (
    <div className="trending-container">
      <strong>Trending Searches:</strong>
      {trending.map((item, index) => (
        <button key={index} onClick={() => onSearch(item)}>
          {item}
        </button>
      ))}
    </div>
  );
};

export default TrendingSearches;