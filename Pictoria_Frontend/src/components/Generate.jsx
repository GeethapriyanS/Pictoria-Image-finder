import React, { useState } from "react";
import axios from "axios";

const GenerateImage = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/generate-image", {
        prompt,
      });
      setMessage(res.data.message);
      setImageData(res.data.image);
    } catch (err) {
      alert("Image generation failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Image Generator (Gemini)</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        style={{ width: "100%", height: "80px", marginBottom: "1rem" }}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}

      {imageData && (
        <img
          src={imageData}
          alt="Generated"
          style={{ marginTop: "1rem", width: "100%", maxWidth: "600px" }}
        />
      )}
    </div>
  );
};

export default GenerateImage;