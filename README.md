# Pictoria - Creative Search, AI Generation & Layered Image Workspace

**Pictoria** is a MERN stack web application built for creators, designers, and curators. It provides an all-in-one visual workspace where users can search stock images, create artwork using a keyless AI generation engine, refine image details inside an embedded Photopea layered editor, and organize assets into public or private collections shareable via unique URLs.

The codebase is structured as a decoupled workspace containing a Node.js/Express REST API backend and a Vite-bundled React frontend application.

---

## Master Architecture

```
Pictoria/
├── Backend/                    # Express.js server & database endpoints
│   ├── config/                 # Database & Cloudinary config files
│   ├── controllers/            # Route controllers (user, image)
│   ├── middlewares/            # JWT validation middleware
│   ├── models/                 # Mongoose database models (User, Image)
│   ├── routes/                 # Express route definitions (user, image)
│   ├── index.js                # Clean server entry point
│   └── package.json            # Node backend packages
├── Pictoria_Frontend/          # React Single Page Application client
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── components/         # React views (Home, Navbar, Profile, Editor)
│   │   ├── css/                # Component styles
│   │   ├── index.css           # Global designs, typography, grids & modals
│   │   └── App.jsx             # Client routers & layout bindings
│   └── package.json            # Client packages
└── README.md                   # Master workspace notes
```

---

## Core Features & Workflows

1. **Aesthetics & Responsive Design**: Crafted with an elegant Outfit/Poppins typography palette, dynamic hover transitions, custom scrollbars, and glassmorphic panels. The interface is responsive down to mobile viewports, complete with compact icon-only navbar toggles.
2. **Search & Curated Feeds**: Integrates with the Unsplash API to offer stock photo search. Features dynamic tags and categories, including a dedicated database-backed **Uploaded Images** feed.
3. **Responsive Lightbox Modal**: Clicking any image opens a detailed pop-up lightbox modal. Action commands (Like/Unlike, Download, Edit Asset, Add to Collection) are aligned beside the image container for high readability.
4. **Custom Image Uploads**: Authenticated users can upload original image files. The Upload Modal features a custom dashed drop-and-drop selector and titles. Images are securely hosted on Cloudinary.
5. **AI Image Generation**: Users can generate original digital artwork from text prompts using Pollinations AI. Images are automatically saved to Cloudinary for permanent storage.
6. **Embedded Photopea Editor**: Selecting any image for editing opens an embedded frame of Photopea. This allows full layered manipulation, filter additions, and text formatting.
7. **Social Curation**: Users can compile curated collections, control privacy, and copy public collection links. If logged in, users can copy other people's public collections directly to their own profiles.

---

## Workspace Setup Guide

Follow these sequential steps to run both the frontend and backend servers concurrently.

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally on port 27017 or a MongoDB Atlas cloud URI)
- Unsplash & Cloudinary API accounts

---

### Step 1: Configure the Server (Backend)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` folder with your credential details:
   ```env
   PORT=5000
   MONGO_URL=mongodb://localhost:27017/pictoria
   JWT_SECRET=your_jwt_signing_key
   UNSPLASH_ACCESS_KEY=your_unsplash_access_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Start the backend:
   ```bash
   npm start
   ```
   The API should indicate `MongoDB Connected Successfully` and run on `http://localhost:5000`.

---

### Step 2: Configure the Client (Frontend)

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd Pictoria_Frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the development workspace link:
   [http://localhost:5173](http://localhost:5173)

---

### Step 3: Compiling for Production
To bundle the frontend application for production hosting, run the build command inside the `Pictoria_Frontend` folder:
```bash
npm run build
```
This outputs compiled asset chunks inside `Pictoria_Frontend/dist/` in 1-2 seconds.
