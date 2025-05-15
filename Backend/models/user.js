const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }]
});

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  username:  { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  likedImages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
  collections: [collectionSchema],
  bio: { type: String },  
  profilePicture: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);