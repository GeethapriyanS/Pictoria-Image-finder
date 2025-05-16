import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Profile.css";
import Navbar from "./Navbar";

const Gallery = () => {
  const [userImages, setUserImages] = useState([]);
  const [collections, setCollections] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/user/${userId}`);
        const { images = [], user } = res.data;
        setUserImages(images);
        setCollections(user?.collections || []);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/user/${userId}/collection/${collectionId}`
      );
      setCollections((prev) => prev.filter((c) => c._id !== collectionId));
    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("Failed to delete collection");
    }
  };

  const downloadImage = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Navbar />
      <div className="gallery-container">
        <h2 className="gallery-title">Your Collections</h2>
        {collections.length > 0 ? (
          <div className="collection-grid">
            {collections.map((collection) => (
              <div key={collection._id} className="collection-card">
                <div className="collection-header">
                  <h4>{collection.name}</h4>
                  <p className="lock">
                    {collection.isPrivate ? "Private" : "Public"} ·{" "}
                    {collection.images.length} image
                    {collection.images.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="image-grid">
                  {collection.images.length > 0 ? (
                    collection.images.map((imgId, index) => {
                      const imgObj = userImages.find((img) => img._id === imgId);
                      return imgObj ? (
                        <div key={index} className="image-card">
                          <img
                            src={imgObj.imageUrl}
                            alt={imgObj.title || "Collection Image"}
                            className="gallery-img"
                          />
                          <button
                            className="download-btn"
                            onClick={() => downloadImage(imgObj.imageUrl)}
                          >
                            Download
                          </button>
                        </div>
                      ) : (
                        <p key={index}>Image not found</p>
                      );
                    })
                  ) : (
                    <p>No images in this collection.</p>
                  )}
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteCollection(collection._id)}
                >
                  Delete Collection
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-collection">No collections created yet.</p>
        )}
      </div>
    </>
  );
};

export default Gallery;
