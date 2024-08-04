var express = require('express');
var router = express.Router();
const Product = require('../models/Product')
const Category = require('../models/Category')
const tracker = require('../middleware/trackVisitor')

let views = 1;

// home page
router.get('/', async function (req, res, next) {
  tracker(req, res, next);
  console.log('views:', views++)
  res.render('index')
});

router.get('/contact', async function (req, res, next) {
  res.render('contactus')
});

// product page
router.get('/products', async function (req, res, next) {
  const products = await Product.find();
  const categorys = await Category.find();
  res.render('products', { products: products, categorys: categorys })
});

router.get('/products/category/:id', async function (req, res, next) {
  try {
    const products = await Product.find({ category: req.params.id });
    const categorys = await Category.find();
    res.render('products', { products: products, categorys: categorys })
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Error fetching product');
  }
});

// product page
router.get('/product/:id', async function (req, res, next) {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    res.render('product', { product: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Error fetching product');
  }
});

//Register page
router.get('/register', isLoggedOut, (req, res) => {
  return res.render('register');
});

//Login page
router.get('/admin', isLoggedOut, (req, res) => {
  return res.render('admin');
});

//Admin Dashboard
router.get('/dashboard', isLoggedIn, async (req, res) => {
  return res.render('dashboard');
});

router.get('/visitors', isLoggedIn, async (req, res) => {
  return res.render('views');
});



function isLoggedIn(req, res, next) {
  req.isAuthenticated() ? next() : res.redirect('/admin');
}

function isLoggedOut(req, res, next) {
  req.isAuthenticated() ? res.redirect('/dashboard') : next();
}

module.exports = router;
