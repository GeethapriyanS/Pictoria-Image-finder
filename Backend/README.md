# Pictoria API - Express/Node Backend

This directory houses the backend server for **Pictoria**, a RESTful API built using Node.js, Express, and MongoDB. It handles user authentication, profile details, stock image search proxying, database uploads, curation collection updates, image liking, and persistence of AI-generated assets.

---

## Technical Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Image Storage**: Cloudinary (for persistent hosting of user uploads and AI creations)
- **Security**: JWT (JSON Web Tokens) & bcryptjs (password hashing)
- **Utilities**: Multer & Multer Storage Cloudinary (multipart form upload processing)

---

## Folder Structure

```
Backend/
├── config/
│   ├── db.js             # Database connection config
│   └── cloudinary.js     # Cloudinary SDK client configuration
├── controllers/
│   ├── imageController.js# Controller handling image and search actions
│   └── userController.js # Controller handling authentication and profile actions
├── middlewares/
│   └── authMiddleware.js # Authentication validation middleware (JWT check)
├── models/
│   ├── image.js          # Mongoose schema for image records
│   └── user.js           # Mongoose schema for users and embedded collections
├── routes/
│   ├── imageRoutes.js    # Routes for image endpoints (search, upload, AI)
│   └── userRoutes.js     # Routes for user endpoints (auth, collections)
├── .env                  # Environment secrets (ignored by Git)
├── index.js              # Clean server entry point
├── package.json          # Node dependencies and scripts
└── README.md             # This file
```

---

## Setup & Installation

1. **Navigate to the Backend Directory**:
   ```bash
   cd Backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `Backend/` directory and configure the following parameters:
   ```env
   PORT=5000
   MONGO_URL=mongodb://localhost:27017/pictoria     # Or your MongoDB Atlas connection string
   JWT_SECRET=your_super_secret_jwt_key
   UNSPLASH_ACCESS_KEY=your_unsplash_access_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the Server**:
   - For development (hot-reload):
     ```bash
     npm run dev
     ```
   - For standard startup:
     ```bash
     npm start
     ```
    The backend server runs by default on [http://localhost:5000](http://localhost:5000).
    
    *Note: The production API server is deployed on Render at `https://pictoria-image-finder1.onrender.com`.*

---

## API Endpoints Reference

### 1. Authentication
- **`POST /signup`**: Registers a new user. Rejects duplicate emails/usernames.
- **`POST /login`**: Validates user credentials. Returns JWT token and the authenticated user's ID.

### 2. User & Profiles
- **`GET /user`**: Retrieves profile details for the currently logged-in user (requires Bearer JWT header).
- **`GET /user/:id`**: Public profile details fetching, populating the user's collections and liked photos.
- **`PATCH /user/:id`**: Updates profile elements (username, bio, profile picture URL).

### 3. Stock Image Proxy & Uploads
- **`GET /search`**: Proxies requests to the Unsplash API to search photos. Prevents exposing client secrets.
- **`GET /user-images`**: Fetches all user-uploaded images from the MongoDB collection.
- **`POST /upload`**: Saves metadata of a newly uploaded Cloudinary image to MongoDB.

### 4. Likes & Curation
- **`POST /user/:userId/like`**: Likes an image (saving it to database if new, and appending to user's favorites list).
- **`POST /user/:userId/unlike`**: Unlikes an image, removing it from user's favorites and collections.

### 5. Collections Management
- **`POST /user/:userId/collections`**: Adds an image to a collection. Creates the collection if it does not exist.
- **`DELETE /user/:userId/collection/:collectionId`**: Deletes a custom collection.
- **`PATCH /user/:userId/collection/:collectionId`**: Updates collection details (name, description, public/private privacy).

### 6. AI Generation
- **`POST /generate`**: Proxies AI creation requests to Pollinations AI, uploads the generated buffer to Cloudinary, and returns a persistent URL.

### 7. Public Sharing
- **`GET /shared-collection/:collectionId`**: Retrieves a collection for public sharing. Blocks private collections unless the requesting user is the owner.
