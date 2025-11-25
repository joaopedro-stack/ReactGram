const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = "reactgram";

        if (req.baseUrl.includes("users")) folder = "reactgram/users";
        if (req.baseUrl.includes("photos")) folder = "reactgram/photos";

        return {
            folder,
            allowed_formats: ["jpg", "png", "jpeg"],
            resource_type: "image",
            public_id: `${Date.now()}-${file.originalname}`,
        };
    },
});

const imageUpload = multer({
    storage,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error("Envie somente png, jpg ou jpeg!"));
        }
        cb(null, true);
    },
});

module.exports = { imageUpload };
