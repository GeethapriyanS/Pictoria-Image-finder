const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/user", verifyToken, userController.getProfile);
router.get("/user/:id", userController.getUserProfileById);
router.patch("/user/:id", userController.updateProfile);
router.post("/user/:userId/like", userController.likeImage);
router.post("/user/:userId/unlike", userController.unlikeImage);
router.post("/user/:userId/collections", userController.addCollection);
router.delete("/user/:userId/collection/:collectionId", userController.deleteCollection);
router.patch("/user/:userId/collection/:collectionId", userController.updateCollection);

module.exports = router;
