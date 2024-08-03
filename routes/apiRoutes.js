const express = require('express');
const router = express.Router();
const apicontroller = require('../controllers/apiController');
const upload = require('../controllers/multer');
const visitors = require('../controllers/visitorController')

router.post('/login',isLoggedOut, apicontroller.login);
router.post('/register',isLoggedOut, apicontroller.register);
router.get('/logout', isLoggedIn,apicontroller.logout);
router.post('/add',isLoggedIn,apicontroller.addproduct);
router.post('/delete/:id', isLoggedIn,apicontroller.deleteproduct);
router.post('/update/:id', isLoggedIn,apicontroller.updateproduct);
router.get('/products',isLoggedIn,apicontroller.getProducts);
router.get('/categories',isLoggedIn,apicontroller.getCategories);
router.get('/product/:id',isLoggedIn, apicontroller.getProductById);
router.get('/product/category/:id',isLoggedIn, apicontroller.getProductsByCategory);
router.get('/category/:id',isLoggedIn, apicontroller.getCategoryById);
router.get('/visitors',isLoggedIn, visitors);


function isLoggedIn(req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/admin');
}

function isLoggedOut(req, res, next) {
    req.isAuthenticated() ? res.redirect('/dashboard') : next();
}

module.exports = router;