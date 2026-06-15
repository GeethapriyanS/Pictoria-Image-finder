# Pictoria Project Documentation

## Overview
The Pictoria project is a full-stack MERN (MongoDB, Express, React, Node.js) application designed for [insert brief description of purpose - e.g., "image generation and management platform"]. 

## Project Structure
```
Pictoria/
├── Backend/                 # Node.js Express backend
│   ├── models/              # Mongoose models
│   │   ├── image.js         # Image schema and model
│   │   └── user.js          # User schema and model
│   ├── config/              # Configuration files
│   │   └── cloudinary.js    # Cloudinary service integration
│   ├── index.js             # Entry point for Express server
│   └── .eslintrc            # ESLint configuration
│
└── Pictoria_Frontend/       # React frontend
    ├── src/
    │   ├── components/      # React components
    │   │   ├── Edit.jsx       # Component for editing profiles
    │   │   ├── Login.jsx      # Authentication component
    │   │   ├── Navbar.jsx     # Navigation bar component
    │   │   ├── Profile.jsx    # User profile display
    │   │   ├── UploadModel.jsx# Image upload component
    │   │   └── Generate.jsx   # Image generation interface
    │   ├── css/               # CSS modules
    │   │   ├── Home3.css      # Home page styling
    │   │   ├── Login.css      # Login page styling
    │   │   ├── Navbar.css     # Navbar styling
    │   │   ├── Profile.css    # Profile page styling
    │   │   ├── GenerateImage.css # Image generation styling
    │   │   └── signup.css     # Signup page styling
    │   ├── images/            # Static image assets
    │   │   ├── download.png
    │   │   ├── like.png
    │   │   ├── search.png
    │   │   ├── logo.png
    │   │   └── default_profile.jpg
    │   ├── main.jsx           # React entry point
    │   ├── index.css          # Global CSS
    │   ├── vite.config.js     # Vite build configuration
    │   └── eslint.config.js   # ESLint configuration
    └── README.md              # Frontend documentation
```

## Key Files
- `Backend/index.js` - Main server entry point
- `Backend/config/cloudinary.js` - Cloudinary configuration for image storage
- `Backend/models/` - Mongoose models for data persistence
- `Pictoria_Frontend/src/components/` - React reusable components
- `Pictoria_Frontend/src/css/` - Styling modules
- `Pictoria_Frontend/src/images/` - Static assets

## Dependencies
### Backend
- Express.js for server framework
- Mongoose for MongoDB modeling
- Cloudinary API for image hosting
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React 18+ for UI components
- Vite for build tooling
- ESLint for code quality
- Various UI utilities and icons

## Git Status
- Modified files in both Backend and Pictoria_Frontend directories require commitment
- Branch: main

##next_prime_ideal_memories
Improvement Ideas:
1. Add comprehensive README sections for setup instructions
2. Document environment variable configuration requirements
3. Create API documentation with example endpoints
4. Add unit/integration test coverage reports

</content>