var express = require('express');
var router = express.Router();
const productController=require('../controllers/productController')
const Product=require('../models/Product')
const adminRouter=require('../routes/adminRoutes')

/* GET home page. */
router.get('/', async function(req, res, next) {
  const product=await Product.find();
res.render('index',{products: product})
});

router.get('/register',requireLoggedOut, (req, res) => {
  return res.render('register');
});

// Login admin
router.get('/login',requireLoggedOut, (req, res) => {
  return res.render('login');
});

// Logout admin
router.get('/logout', isLoggedIn, (req, res) => {
  return res.render('logout');
});


router.get('/create',isLoggedIn, (req, res) => {
  res.render('createProduct');
});

// Render single product view
router.get('/products/:productId', productController.getProductById);

// Get all products
router.get('/products', productController.getAllProducts);

router.get('/admin', isLoggedIn, (req, res) => {
  return res.render('admin');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

function requireLoggedOut(req, res, next) {
  if (req.isAuthenticated()) {
      return res.redirect('/logout');
  }
  next();
}

module.exports = router;
