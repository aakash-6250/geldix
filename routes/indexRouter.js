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



// Render single product view
router.get('/products/:productId', productController.getProductById);


router.get('/admin',requireLoggedOut ,(req, res) => {
  return res.render('admin');
});

router.get('/dashboard',isLoggedIn ,(req, res) => {
  return res.render('dashboard');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/admin');
};

function requireLoggedOut(req, res, next) {
  if (req.isAuthenticated()) {
      return res.redirect('/logout');
  }
  next();
}

module.exports = router;
