import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import ImageList from "./ImageList";
import TrendingSearches from "./TreandingSearches";
import axios from "axios";
import "../css/Home1.css";
import image1 from "../images/search.png";

const Home1 = () =>{
    const [searchTerm, setSearchTerm] = useState("");
    const [images, setImages] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [trendingSearches, setTrendingSearches] = useState(["Nature", "Animals", "Books", "Technology"]);
  
    const fetchImages = async (query) => {
      try {
        const response = await axios.get(`http://localhost:5000/search?query=${query}`);
        setImages(response.data.results);
        
        if (!recentSearches.includes(query)) {
          setRecentSearches([query, ...recentSearches.slice(0, 4)]); // Store last 5 searches
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };
  
    const handleSearch = () => {
      if (searchTerm) {
        fetchImages(searchTerm);
        setSearchTerm("");
      }
    };
  
    return (
      <div className="container">
        <header className="homepage-header">
        <h1 className="homepage-title">Pictoria</h1>
        <p className="homepage-description">
          Discover the internet's best visuals. Search now and get inspired.
        </p>
      </header>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}><img src={image1} alt="" /></button>
        </div>
  
        <div className="search-info">
          <div className="recent-searches">
            <strong>Recent Searches:</strong>
            {recentSearches.map((item, index) => (
              <span key={index} className="tag">{item}</span>
            ))}
          </div>
  
          <div className="trending-searches">
            <strong>Trending Searches:</strong>
            {trendingSearches.map((item, index) => (
              <span key={index} className="tag">{item}</span>
            ))}
          </div>
        </div>
  
        <div className="image-grid">
          {images.map((img) => (
            <img key={img.id} src={img.urls.small} alt={img.alt_description} />
          ))}
        </div>
      </div>
    );
  };
//   const [images, setImages] = useState([]);
//   const [trending, setTrending] = useState([]);
//   const [recentSearches, setRecentSearches] = useState([]);

//   useEffect(() => {
//     fetchTrendingSearches();
//   }, []);

//   const fetchTrendingSearches = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/trending");
//       setTrending(response.data);
//     } catch (error) {
//       console.error("Error fetching trending searches:", error);
//     }
//   };

//   const handleSearch = async (query) => {
//     try {
//       const response = await axios.get("http://localhost:5000/search", {
//         params: { query },
//       });
//       setImages(response.data.results);
//       setRecentSearches((prev) => [...new Set([query, ...prev])].slice(0, 5));
//     } catch (error) {
//       console.error("Error fetching images:", error);
//     }
//   };

//   return (
//     <div className="app-container">
//       <SearchBar onSearch={handleSearch} recentSearches={recentSearches} />
//       <TrendingSearches trending={trending} onSearch={handleSearch} />
//       <ImageList images={images} />
//     </div>
//   );
// };

export default Home1;
