import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';
import API_BASE_URL from '../config';

export default function PhotopeaEditor() {
  const location = useLocation();
  const [url, setUrl] = useState('');
  const [userImages, setUserImages] = useState([]);

  useEffect(() => {
    if (location.state && location.state.imageUrl) {
      setUrl(location.state.imageUrl);
    }
  }, [location]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    const fetchUserImages = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/user/${userId}`);
        setUserImages(res.data.images || []);
      } catch (err) {
        console.error("Failed to fetch user images", err);
      }
    };
    fetchUserImages();
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const photopeaUrl = url ? `https://www.photopea.com#%7B"files":["${encodedUrl}"]%7D` : '';

  return (
    <>
      <Navbar />
      <div className="editor-page-container">
        {!url ? (
          <div className="editor-selector-card">
            <h2>Select Image to Edit</h2>
            <p>Paste an image URL or choose one of your uploaded images below to start editing in Photopea.</p>
            
            <div className="editor-url-input-container">
              <input 
                type="text" 
                placeholder="Paste Image URL here..." 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                className="editor-url-input"
              />
            </div>

            {userImages.length > 0 && (
              <div className="editor-image-select-grid-container">
                <h3>Your Uploaded Images:</h3>
                <div className="editor-image-grid">
                  {userImages.map((img) => (
                    <div 
                      key={img._id} 
                      className="editor-image-card"
                      onClick={() => setUrl(img.imageUrl)}
                    >
                      <img src={img.imageUrl} alt={img.title} />
                      <div className="editor-image-card-title">{img.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="editor-frame-container">
            <div className="editor-bar">
              <span>Editing: <strong>{url.substring(0, 60)}...</strong></span>
              <button className="editor-change-img-btn" onClick={() => setUrl('')}>Select Another Image</button>
            </div>
            <iframe
              title="Photopea Editor"
              src={photopeaUrl}
              width="100%"
              height="700px"
              style={{ border: 'none', borderRadius: '12px'}}
            />
          </div>
        )}
      </div>
    </>
  );
}
