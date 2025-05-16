const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Image = require("./models/image");
const axios = require("axios");
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./config/cloudinary');

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config(); 

const JWT_SECRET = process.env.JWT_SECRET;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pictoria_images',
    format: async () => 'jpeg',
    public_id: () => Date.now().toString(), // Ensures unique filenames
  },
});

const upload = multer({ storage });

const HUGGING_FACE_API = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2";
const HF_TOKEN = "Bearer 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"; // Replace with your real token

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      HUGGING_FACE_API,
      { inputs: prompt },
      {
        headers: {
          Authorization: HF_TOKEN,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    res.json({ image: `data:image/png;base64,${base64Image}` });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

// Upload API Route
app.post("/upload", async (req, res) => {
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
});



// MongoDB Connection
mongoose.connect(process.env.MONGO_URL).then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Failed:", err));

// User Signup
app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? "Email already exists" : "Username already exists", 
        status: 0 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, username, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", status: 1 });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server Error", status: 0 });
  }
});

// User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found", isValid: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", isValid: false });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });

    res.status(200).json({ message: "Login successful", token, isValid: true ,userId:user._id});

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Middleware to Verify Token
const verifyToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

// Fetch User Profile
app.get("/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
});

// Image Search API
app.get("/search", async (req, res) => {
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
});

app.get("/user-images", async (req, res) => {
  try {
    const images = await Image.find(); // Fetch all images from DB
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching images" });
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    const images = await Image.find({ uploadedBy: userId }).sort({ createdAt: -1 });

    res.json({ user, images });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/user/:userId/like", async (req, res) => {
  const { userId } = req.params;
  const { imageUrl, title } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find or create the Image
    let image = await Image.findOne({ imageUrl });
    if (!image) {
      image = new Image({ imageUrl, title, uploadedBy: userId });
      await image.save();
    }

    // Check if already liked
    const alreadyLiked = user.likedImages.includes(image._id);
    if (alreadyLiked) {
      return res.status(400).json({ message: "Image already liked" });
    }

    // Add to likedImages
    user.likedImages.push(image._id);
    await user.save();

    res.status(200).json({ message: "Image liked successfully" });
  } catch (error) {
    console.error("Error liking image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /user/:userId/unlike
app.post("/user/:userId/unlike", async (req, res) => {
  const { userId } = req.params;
  const { imageId } = req.body; // <-- imageId not imageUrl

  if (!mongoose.Types.ObjectId.isValid(imageId)) {
    return res.status(400).json({ error: "Invalid image ID" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1. Remove from likedImages (ObjectId comparison)
    user.likedImages = user.likedImages.filter(
      (id) => id.toString() !== imageId
    );

    // 2. Remove from all collections (collections.images also have ObjectIds)
    user.collections = user.collections.map((collection) => {
      return {
        ...collection,
        images: collection.images.filter(
          (id) => id.toString() !== imageId
        ),
      };
    });

    await user.save();

    res.status(200).json({ message: "Image unliked and removed from collections" });
  } catch (err) {
    console.error("Error unliking image:", err);
    res.status(500).json({ error: "Failed to unlike image" });
  }
});

app.post("/user/:userId/collections", async (req, res) => {
  const { userId } = req.params;
  const { name, description, imageUrl, title } = req.body;

  try {
    // 1. Check if image already exists, else create it
    let image = await Image.findOne({ imageUrl });

    if (!image) {
  image = new Image({ imageUrl, title, uploadedBy: userId });
  await image.save();
}


    // 2. Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 3. Check if collection with the same name already exists
   let collection = user.collections.find(
  (col) => col.name.toLowerCase() === name.toLowerCase()
);

    if (collection) {
      // Avoid adding the same image twice
      if (!collection.images.includes(image._id)) {
        collection.images.push(image._id);
      }
    } else {
      // Create new collection
      user.collections.push({
        name,
        description,
        images: [image._id],
      });
    }

    // 4. Save the updated user
    await user.save();

    res.status(200).json({ message: "Image added to collection successfully" });
  } catch (error) {
    console.error("Error adding to collection:", error);
    res.status(500).json({ error: "Failed to add image to collection" });
  }
});


// DELETE /user/:userId/collection/:collectionId
app.delete('/user/:userId/collection/:collectionId', async (req, res) => {
  try {
    const { userId, collectionId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.collections = user.collections.filter(
      (collection) => collection._id.toString() !== collectionId
    );

    await user.save();
    res.status(200).json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /user/:userId
// Update User Profile
app.patch("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, bio, profilePicture } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, bio, profilePicture },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});


app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});