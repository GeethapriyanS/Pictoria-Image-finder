import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/Home3.css";
import logo from "../images/logo.png";
import searchIcon from "../images/search.png";
import UploadModal from "./uploadmodel.jsx";
import like from "../images/like.png"
import download from "../images/download.png"

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

  const fetchUserImages = async () => {
  try {
    const response = await axios.get("http://localhost:5000/user-images");
    return response.data.images || [];
  } catch (error) {
    console.error("Error fetching user images:", error);
    return [];
  }
};

const fetchImages = async (query, newPage = 1) => {
    try {
      setLoading(true);
      setLastQuery(query);
  
      // Fetch user-uploaded images
      const userResponse = await axios.get("http://localhost:5000/user-images");
      const userImages = userResponse.data.images.map((img) => ({
        id: img._id, // MongoDB ID
        imageUrl: img.imageUrl, // Custom user-uploaded image URL
        title: img.title,
        isUserUpload: true, // Flag for distinguishing
      }));
  
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
  

  const handleSearch = () => {
    if (searchTerm) {
      fetchImages(searchTerm, 1);
      setSearchTerm("");
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
    <div className="container">
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="Pictoria Logo" />
          <h1>Pictoria</h1>
        </div>
        <div className="nav-links">
          {isLoggedIn ? (
            <>
              <button className="upload" onClick={() => setShowUpload(true)}>Upload</button>
              <button className="logout" onClick={handleLogout}>Logout</button>
              <Link to="/profile"><button className="profile">Profile</button></Link>
            </>
          ) : (
            <>
              <Link to="/login"><button className="login">Login</button></Link>
              <Link to="/signup"><button className="signup">Sign Up</button></Link>
            </>
          )}
        </div>
      </nav>

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
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" onClick={handleSearch}><img src={searchIcon} alt="search" /></button>
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
  );
};

export default Home3;
