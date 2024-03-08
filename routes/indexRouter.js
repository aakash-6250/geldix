var express = require('express');
var router = express.Router();
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



function isLoggedIn(req, res, next) {
  req.isAuthenticated() ? next() : res.redirect('/admin');
}

function isLoggedOut(req, res, next) {
  req.isAuthenticated() ? res.redirect('/dashboard') : next();
}

module.exports = router;
