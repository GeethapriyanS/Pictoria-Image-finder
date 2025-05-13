import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/Home3.css";
import logo from "../images/logo.png";
import searchIcon from "../images/search.png";
import UploadModal from "./uploadmodel.jsx";
import like from "../images/like.png";
import download from "../images/download.png";
import Navbar from "./Navbar.jsx";

const Home3 = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const navigate = useNavigate();

  const [trendingSearches] = useState([
    "Sports", "Travel", "Art", "Animals", "Finance", "Technology", "Cars"
  ]);

  useEffect(() => {
    const user = localStorage.getItem("token");
    if (user) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    // Fetch all images by default when the page loads
    const fetchAllImages = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/all-images"); // API endpoint for all images
        setImages(response.data.images || []);
      } catch (error) {
        console.error("Error fetching all images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllImages();
  }, []);

  const fetchImages = async (query, newPage = 1) => {
    try {
      setLoading(true);
      setLastQuery(query);

      // Fetch Unsplash images only if there is a query
      let unsplashImages = [];
      if (query) {
        const unsplashResponse = await axios.get("http://localhost:5000/search", {
          params: { query, per_page: 28, page: newPage },
        });

        unsplashImages = unsplashResponse.data.results.map((img) => ({
          id: img.id,
          imageUrl: img.urls.small,
          title: img.alt_description || "Untitled",
          isUserUpload: false,
        }));
      }

      // Merge both sets of images
      setImages(unsplashImages);
      setPage(newPage);
      setHasMore(unsplashImages.length === 28);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm) {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/search", {
          params: { query: searchTerm },
        });
        setImages(response.data.results || []);
      } catch (error) {
        console.error("Error searching images:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleNextPage = () => {
    fetchImages(lastQuery, page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      fetchImages(lastQuery, page - 1);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <>
      <Navbar setShowUpload={setShowUpload} />
      <div className="container">
        <header className="homepage-header">
          <h1 className="homepage-title">Discover the best content on Pictoria</h1>
          <p className="homepage-description">Choose your interests</p>
        </header>

        <div className="trending-tags">
          {trendingSearches.map((item, index) => (
            <span key={index} className="tag" onClick={() => fetchImages(item, 1)}>{item}</span>
          ))}
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} // Trigger search on "Enter" key press
          />
          <button type="button" onClick={handleSearch}>
            <img src={searchIcon} alt="Search" />
          </button>
        </div>

        {loading ? <p>Loading...</p> : (
          <>
            <div className="image-grid">
              {images.map((img) => (
                <div key={img.id} className="image-card">
                  <img src={img.imageUrl} alt={img.title} />

                  <div className="image-overlay">
                    <button className="like-btn"><img src={like} alt="like" /></button>

                    <a href={img.imageUrl} download className="download-btn"><img src={download} alt="download" /></a>

                    {img.isUserUpload && (
                      <Link to={`/profile/${img.id}`} className="profile-link">👤</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination">
              <button onClick={handlePrevPage} disabled={page === 1}>Previous</button>
              <span> Page {page} </span>
              <button onClick={handleNextPage} disabled={!hasMore}>Next</button>
            </div>
          </>
        )}

        {showUpload && <UploadModal close={() => setShowUpload(false)} />}
      </div>
    </>
  );
};

export default Home3;
