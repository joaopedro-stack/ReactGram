const express = require("express")
const router = express.Router()

// Controller
const { insertPhoto, deletePhoto, getAllPhotos, getUserPhotos, getPhotoById, updatePhoto, likePhoto, commentPhoto, searchPhotos } = require("../controllers/PhotoController")

// Middlewares
const { photoInsertValidation, photoUpdateValidation, commentPhotoValidation } = require("../middlewares/photoValidation");
const authGuard = require("../middlewares/authGuard")
const validate = require('../middlewares/handleValidation')
const {imageUpload} = require("../middlewares/imageUpload")

// Routes
router.post(
  "/",
  authGuard,
  (req, res, next) => {
    imageUpload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ errors: [err.message] });
      }
      next();
    });
  },
  photoInsertValidation(),
  validate,
  insertPhoto
);
router.delete("/:id" , authGuard, deletePhoto)
router.get("/" , authGuard, getAllPhotos)
router.get("/user/:id" , authGuard, getUserPhotos)
router.get("/search", authGuard,searchPhotos)

router.get("/:id" , authGuard, getPhotoById)
router.put("/:id", authGuard,photoUpdateValidation(), validate,updatePhoto)
router.put("/like/:id", authGuard,likePhoto)
router.put("/comment/:id", authGuard, commentPhotoValidation(), validate, commentPhoto)
module.exports = router

