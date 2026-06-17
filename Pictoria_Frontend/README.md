# Pictoria Frontend - React + Vite Application

This directory contains the user interface for **Pictoria**, built as a responsive Single Page Application (SPA) using React 18, Vite, and custom CSS stylesheets.

---

## Key Features

- **Responsive Navigation**: Adaptive header that collapses text labels into sleek, mobile-friendly icons on narrow viewports.
- **Stock & User Photo Search**: Merged client searching supporting both Unsplash stock search and user-uploaded assets under the "Uploaded Images" category.
- **Interactive Lightbox**: Detailed pop-up details modal showing image titles and details alongside modular, aligned action handlers (Like, Download, Edit Asset, Add to Collection).
- **Layered Photo Editing**: Embedded, seamless **Photopea** layered image editor inside an iframe to perform custom crops, overlays, and color grading.
- **AI Asset Generation**: Image creation interface triggering keyless prompts and persisting creations with safe hosting.
- **Client Curation**: Interface for user collections, allowing quick public/private updates, collection sharing, and profile replication copies.

---

## File Structure

```
Pictoria_Frontend/
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Images and design resources
│   ├── components/         # React pages & components
│   │   ├── Edit.jsx        # Photopea editor workspace page
│   │   ├── Gallery.jsx     # Collections overview page
│   │   ├── Generate.jsx    # AI Image prompt generator page
│   │   ├── Home3.jsx       # Landing homepage, grid, search & lightbox popup
│   │   ├── Login.jsx       # Login form component
│   │   ├── Navbar.jsx      # Sticky responsive navbar component
│   │   ├── Profile.jsx     # User dashboard (Photos, Likes, Collections)
│   │   ├── SharedCollection.jsx # Shared collection display layout
│   │   ├── Signup.jsx      # Signup form component
│   │   └── uploadmodel.jsx # Custom dashed drag-and-drop Upload Modal
│   ├── css/                # Custom CSS styling files
│   │   ├── GenerateImage.css
│   │   ├── Home3.css
│   │   ├── Login.css
│   │   ├── Navbar.css
│   │   ├── Profile.css
│   │   └── signup.css
│   ├── App.jsx             # React router configuration and main container
│   ├── index.css           # Global typography, color tokens, grids, modals, and responsive states
│   └── main.jsx            # DOM render entrypoint
├── index.html              # HTML structure template
├── package.json            # Client dependencies and npm scripts
└── README.md               # This file
```

---

## Setup & Installation

1. **Navigate to the Frontend Directory**:
   ```bash
   cd Pictoria_Frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in this directory (refer to `.env.example`) and set your backend API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
   For connecting to the live hosted backend on Render, use:
   ```env
   VITE_API_BASE_URL=https://pictoria-image-finder1.onrender.com
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for Production**:
   To bundle the assets into the production-ready `dist/` folder:
   ```bash
   npm run build
   ```
   To verify the built artifacts locally:
   ```bash
   npm run preview
   ```
