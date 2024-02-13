const multer=require("multer");
const {v4: uuidv4} = require("uuid");
const path= require("path");

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/products')
    },
    filename: function (req, file, cb) {
      const uniquename= uuidv4();
      cb(null, uniquename+path.extname(file.originalname))
    }
  })

  const filter = function (req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and jpg files are allowed.'), false);
    }
  };


  
  
const updload = multer({ storage: storage ,  fileFilter: filter});


module.exports=updload;