const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");

const tempDir = path.join(__dirname, "../", "tmp");

const multerConfig = multer.diskStorage({
  destination: tempDir,
    filename: function (req, file, cb) {
      console.log(file.originalname);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: multerConfig });

module.exports = upload;
