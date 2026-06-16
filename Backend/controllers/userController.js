const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const Image = require("../models/image");

const JWT_SECRET = process.env.JWT_SECRET;

// User Signup
const signup = async (req, res) => {
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
};

// User Login
const login = async (req, res) => {
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
};

// Fetch User Profile (Authenticated)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// Fetch User Profile by ID (Public/Details)
const getUserProfileById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate("collections.images")
      .populate("likedImages")
      .select("-password");
    const images = await Image.find({ uploadedBy: userId }).sort({ createdAt: -1 });

    res.json({ user, images });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
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
};

// Like Image
const likeImage = async (req, res) => {
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

    // Check if already liked using objectId string check
    const alreadyLiked = user.likedImages.some((id) => id.toString() === image._id.toString());
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
};

// Unlike Image
const unlikeImage = async (req, res) => {
  const { userId } = req.params;
  const { imageId } = req.body;

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

    // 2. Remove from all collections
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
};

// Add to Collection
const addCollection = async (req, res) => {
  const { userId } = req.params;
  const { name, description, imageUrl, title, isPrivate } = req.body;

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
      // Avoid adding the same image twice using objectId string check
      if (!collection.images.some((id) => id.toString() === image._id.toString())) {
        collection.images.push(image._id);
      }
      if (isPrivate !== undefined) {
        collection.isPrivate = isPrivate;
      }
    } else {
      // Create new collection
      user.collections.push({
        name,
        description,
        images: [image._id],
        isPrivate: isPrivate || false,
      });
    }

    // 4. Save the updated user
    await user.save();

    res.status(200).json({ message: "Image added to collection successfully" });
  } catch (error) {
    console.error("Error adding to collection:", error);
    res.status(500).json({ error: "Failed to add image to collection" });
  }
};

// Delete Collection
const deleteCollection = async (req, res) => {
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
};

// Update Collection Privacy/Details
const updateCollection = async (req, res) => {
  try {
    const { userId, collectionId } = req.params;
    const { isPrivate, name, description } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const collection = user.collections.id(collectionId);
    if (!collection) return res.status(404).json({ error: "Collection not found" });

    if (isPrivate !== undefined) collection.isPrivate = isPrivate;
    if (name !== undefined) collection.name = name;
    if (description !== undefined) collection.description = description;

    await user.save();
    res.json({ success: true, message: "Collection updated successfully", collection });
  } catch (error) {
    console.error("Error updating collection:", error);
    res.status(500).json({ error: "Failed to update collection" });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  getUserProfileById,
  updateProfile,
  likeImage,
  unlikeImage,
  addCollection,
  deleteCollection,
  updateCollection,
};
