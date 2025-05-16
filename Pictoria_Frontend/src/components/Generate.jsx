import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "../css/GenerateImage.css"

const GenerateImage = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const generateImage = async () => {
    if (!prompt.trim()) return alert("Please enter a prompt.");

    setLoading(true);
    setImage(null);

    try {
      const res = await axios.post("http://localhost:5000/generate", { prompt });
      setImage(res.data.image);
      setHistory((prev) => [prompt, ...prev.slice(0, 4)]);
    } catch (err) {
      alert("Failed to generate image");
      console.error(err);
    }

    setLoading(false);
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = `generated-${Date.now()}.png`;
    link.click();
  };

  const promptSuggestions = [
    "A futuristic city skyline at sunset",
    "A cat wearing sunglasses on the beach",
    "A fantasy forest with glowing mushrooms",
    "A spaceship flying through a nebula",
    "A steampunk-style mechanical dragon"
  ];

  return (
    <>
      <Navbar />
      <div className="image-generator-container">
        <h1 className="image-generator-title">AI Image Generator</h1>
        <p className="image-generator-description">
          Enter a creative prompt to generate a stunning image using AI.
        </p>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="E.g., A neon tiger running through the jungle"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="prompt-input"
          />
          <button
            onClick={generateImage}
            disabled={loading}
            className="generate-btn"
          >
            {loading ? "Generating..." : "Generate Image"}
          </button>
        </div>

        {image && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <img src={image} alt="Generated" className="image-preview" />
            <button onClick={downloadImage} className="download-btn">
              Download Image
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div className="prompt-history">
            <h2 className="prompt-history-title">Prompt History</h2>
            <ul className="prompt-list">
              {history.map((item, idx) => (
                <li key={idx} className="text-sm">{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="prompt-suggestions">
          <h2 className="prompt-suggestions-title">Prompt Suggestions</h2>
          <div className="flex flex-wrap">
            {promptSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(suggestion)}
                className="prompt-suggestion-btn"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GenerateImage;
