import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

const UploadModal = ({ close }) => {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async () => {
    const userId = localStorage.getItem("userId");
    if (!image) return alert("Please select an image.");
    if (!userId) return alert("User not authenticated.");
  
    setUploading(true);
  
    try {
      const imageData = new FormData();
      imageData.append("file", image);
      imageData.append("upload_preset", "image-upload"); 
  
      const cloudinaryResponse = await axios.post(
        "https://api.cloudinary.com/v1_1/devlcjqvg/image/upload",
        imageData
      );
  
      const imageUrl = cloudinaryResponse.data.secure_url; // Get the Cloudinary image URL
      console.log("Cloudinary URL:", imageUrl);
  
      const formData = {
        title,
        imageUrl, 
        uploadedBy: userId,
      };
  
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "application/json" }, 
      });
  
      alert("Image uploaded successfully!");
      close();
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <div className="upload-modal">
      <div className="modal-content">
        <h2>Upload Image</h2>
        
        <div className="upload-form-group">
          <label>Title</label>
          <input 
            type="text" 
            placeholder="Give your artwork a title..." 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>

        <div className="upload-form-group">
          <label>Select Image File</label>
          <label className="file-input-container">
            <span className="file-icon">📁</span>
            <span className="file-upload-text">
              {image ? image.name : "Click to select or drag & drop image"}
            </span>
            <span className="file-upload-subtext">Supports PNG, JPG, JPEG, WEBP</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImage(e.target.files[0])} 
            />
          </label>
        </div>

        <div className="upload-buttons">
          <button className="upload-btn" onClick={handleImageUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button className="cancel-btn" onClick={close}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
