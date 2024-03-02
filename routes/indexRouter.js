var express = require('express');
var router = express.Router();
const productController=require('../controllers/productController')
const Product=require('../models/Product')

// home page
router.get('/', async function(req, res, next) {
  const product=await Product.find();
res.render('index',{products: product})
});

//Register page
router.get('/register',isLoggedOut, (req, res) => {
  return res.render('register');
});

//Login page
router.get('/admin',isLoggedOut ,(req, res) => {
  return res.render('admin');
});

//Admin Dashboard
router.get('/dashboard' ,isLoggedIn,(req, res) => {
  return res.render('dashboard');
});



// Render single product view
router.get('/products/:productId', productController.getProductById);

// Get all products
router.get('/products', productController.getAllProducts);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/admin');
};

function isLoggedOut(req, res, next) {
  if (req.isAuthenticated()) {
      return res.redirect('/logout');
  }
  next();
}

module.exports = router;
