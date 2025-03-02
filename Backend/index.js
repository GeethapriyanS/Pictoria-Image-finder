const dotenv=require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/user");

const app = express();
app.use(cors());
dotenv.config();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Failed:", err));


app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? "Email already exists" : "Username already exists" , status:0
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, username, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" ,status:1});

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server Error" , status:0});
  }
});


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

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token, isValid: true });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

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

app.get("/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
});


app.get("/json", verifyToken, (req, res) => {
  res.json({ message: "Middleware verification successful", user: req.user });
});


app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
