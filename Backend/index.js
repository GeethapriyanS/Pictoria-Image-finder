const dotenv = require("dotenv");
// Initialize dotenv configuration immediately
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const imageRoutes = require("./routes/imageRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/", userRoutes);
app.use("/", imageRoutes);

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});