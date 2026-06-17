const axios = require("axios");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Image = require("../models/image");
const User = require("../models/user");
const cloudinary = require("../config/cloudinary");

const JWT_SECRET = process.env.JWT_SECRET;

// Upload Image
const uploadImage = async (req, res) => {
  try {
    const { title, imageUrl, uploadedBy } = req.body;

    if (!title || !imageUrl || !uploadedBy) {
      return res.status(400).json({ error: "Title, Image URL, and UploadedBy are required." });
    }

    console.log("✅ Received Data:", title, imageUrl, uploadedBy);

    // Save to MongoDB
    const newImage = new Image({ title, imageUrl, uploadedBy });
    await newImage.save();

    console.log("✅ Image Saved:", newImage);
    res.status(201).json({ message: "Image uploaded successfully!", imageUrl });

  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

// Image Search API
const searchImages = async (req, res) => {
  const { query, page = 1, per_page = 28 } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: { query, per_page, page },
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`},
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
};

// Get User Images
const getUserImages = async (req, res) => {
  try {
    const images = await Image.find(); // Fetch all images from DB
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching images" });
  }
};

// AI Image Generation Route
const generateAIImage = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    console.log(" Generating AI image for prompt:", prompt);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in .env file");
    }

    let buffer;
    try {
      console.log("🤖 Attempting image generation with Gemini API...");
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"] }
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0] &&
        response.data.candidates[0].content.parts[0].inlineData
      ) {
        const base64Data = response.data.candidates[0].content.parts[0].inlineData.data;
        buffer = Buffer.from(base64Data, "base64");
        console.log("✅ Image generated successfully using Gemini API!");
      } else {
        throw new Error("Unexpected response structure from Gemini API");
      }
    } catch (geminiError) {
      const errMsg = geminiError.response?.data?.error?.message || geminiError.message;
      console.warn("⚠️ Gemini API Image Generation failed:", errMsg);
      console.log("🔄 Falling back to Pollinations AI for image generation...");

      // Fallback: Pollinations AI is used to provide keyless, high quality image generation
      const encodedPrompt = encodeURIComponent(prompt);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

      let retries = 3;
      let delay = 2000; // 2 seconds delay initially

      while (retries > 0) {
        try {
          console.log(`🔄 Attempting Pollinations AI image generation... (Retries left: ${retries})`);
          const imageResponse = await axios.get(pollinationsUrl, { 
            responseType: "arraybuffer",
            timeout: 60000 // 60s timeout
          });
          buffer = Buffer.from(imageResponse.data, "binary");
          break; // success
        } catch (err) {
          retries--;
          const isTimeout = err.code === 'ECONNABORTED';
          const is402 = err.response && err.response.status === 402;
          
          if (retries > 0) {
            console.warn(`⚠️ Pollinations AI request failed (${isTimeout ? 'Timeout' : err.message}). Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay += 1000; // increase delay for next retry
          } else {
            // Log full error text if available in response
            if (err.response && err.response.data) {
              const errText = Buffer.from(err.response.data).toString('utf8');
              console.error(`❌ Pollinations AI failed:`, errText);
            }
            throw err;
          }
        }
      }
    }

    // Upload the buffer to Cloudinary so it is persistent and stable
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "generated_images", format: "jpeg" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const cloudinaryResult = await uploadPromise;
    console.log("✅ Generated image saved to Cloudinary:", cloudinaryResult.secure_url);
    res.json({ success: true, image: cloudinaryResult.secure_url });
  } catch (error) {
    console.error("❌ Image generation failed:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
};

// Get Shared Collection
const getSharedCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;

    // Find user who owns the collection
    const user = await User.findOne({ "collections._id": collectionId })
      .populate("collections.images")
      .select("username profilePicture collections");

    if (!user) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const collection = user.collections.id(collectionId);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // Check privacy authorization
    if (collection.isPrivate) {
      let token = req.headers.authorization;
      let isOwner = false;
      if (token) {
        try {
          if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
          }
          const decoded = jwt.verify(token, JWT_SECRET);
          if (decoded.id === user._id.toString()) {
            isOwner = true;
          }
        } catch (err) {
          // invalid token
        }
      }

      if (!isOwner) {
        return res.status(403).json({ error: "This collection is private" });
      }
    }

    res.json({
      success: true,
      owner: {
        username: user.username,
        profilePicture: user.profilePicture,
        _id: user._id,
      },
      collection,
    });
  } catch (error) {
    console.error("Error fetching shared collection:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  uploadImage,
  searchImages,
  getUserImages,
  generateAIImage,
  getSharedCollection,
};
