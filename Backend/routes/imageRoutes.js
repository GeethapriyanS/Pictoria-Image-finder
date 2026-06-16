const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");

router.post("/upload", imageController.uploadImage);
router.get("/search", imageController.searchImages);
router.get("/user-images", imageController.getUserImages);
router.post("/generate", imageController.generateAIImage);
router.get("/shared-collection/:collectionId", imageController.getSharedCollection);

module.exports = router;
