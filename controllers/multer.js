const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const allowedMimeTypes = ['image/jpeg','image/JPEG', 'image/PNG', 'image/JPG', 'image/WEBP', 'image/png', 'image/jpg', 'image/webp'];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/temp');
    },
    filename: function (req, file, cb) {
        const uniquename = uuidv4();
        cb(null, uniquename + path.extname(file.originalname));
    }
});

const filter = function (req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, WEBP, PNG, and JPG files are allowed.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: filter }).single('image');

module.exports = upload;
