import React, { useState } from "react";
import "../css/Home.css";

const PictoriaHomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchTerm}&client_id=ZUmfiURKkG_aMP7JSwZx03CKUep7jlJHpx0h1eqYIFI`
      );
      const data = await response.json();
      setImages(data.results);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1 className="homepage-title">Pictoria</h1>
        <p className="homepage-description">
          Discover the internet's best visuals. Search now and get inspired.
        </p>
      </header>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search photos and illustrations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button
          onClick={fetchImages}
          disabled={loading}
          className="search-button"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {images.length > 0 && (
        <section className="image-grid">
          {images.map((image) => (
            <article key={image.id} className="image-card">
              <img
                src={image.urls.small}
                alt={image.alt_description || "Image"}
                className="image"
              />
              <div className="image-details">
                <p className="image-description">
                  {image.alt_description || "Untitled Image"}
                </p>
                <a
                  href={image.user.links.html}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="image-author"
                >
                  By {image.user.name}
                </a>
              </div>
            </article>
          ))}
        </section>
      )}

      {images.length === 0 && !loading && (
        <div className="no-results-container">
          <p className="no-results-text">
            No images found. Try searching for something else!
          </p>
        </div>
      )}
    </div>
  );
};

export default PictoriaHomePage;
