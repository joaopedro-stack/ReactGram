// middlewares/imageUpload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: "reactgram/photos",
      allowed_formats: ["jpg", "png", "jpeg"],
      resource_type: "image",
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

// fileFilter com log para debug
const imageUpload = multer({
  storage,
  fileFilter(req, file, cb) {
    console.log("UPLOAD RECEBIDO =>", file);
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/i)) {
      return cb(new Error("Envie somente png, jpg ou jpeg!"));
    }
    cb(null, true);
  },
});

module.exports = { imageUpload };
