const express = require('express');
const router = express.Router();
const apicontroller = require('../controllers/apiController'); // Fix: Changed import statement to '../controllers/apiController'
const upload = require('../controllers/multer');

router.post('/login',isLoggedOut, apicontroller.login);
router.post('/register',isLoggedOut, apicontroller.register);
router.get('/logout', isLoggedIn,apicontroller.logout);
router.post('/add',isLoggedIn,apicontroller.addproduct);
router.post('/delete/:id', isLoggedIn,apicontroller.deleteproduct);
router.post('/update/:id', isLoggedIn,apicontroller.updateproduct);
router.get('/products',apicontroller.allproducts);
router.get('/product/:id', apicontroller.getProductById);



function isLoggedIn(req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/admin');
}

function isLoggedOut(req, res, next) {
    req.isAuthenticated() ? res.redirect('/dashboard') : next();
}

module.exports = router;