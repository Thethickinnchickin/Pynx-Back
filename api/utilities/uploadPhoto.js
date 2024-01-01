const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utilities/cloudinaryConfig')

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'Pnyx'
    },
  });

// Multer config
module.exports = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("Unsupported file type!"), false);
      return;
    }
    cb(null, true);
  },
});