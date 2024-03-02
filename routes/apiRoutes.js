const express = require('express');
const router = express.Router();
const apicontroller = require('../controllers/apiController');
const upload = require('../controllers/multer');



router.post('/login',isLoggedOut, apicontroller.login);

router.post('/register',isLoggedOut, apicontroller.register);

router.post('/logout', isLoggedIn,apicontroller.logout);

router.post('/add',isLoggedIn,updload.single('image'),apicontroller.addproduct);

router.post('/delete', isLoggedIn,apicontroller.deleteproduct);

router.post('/update/:id', isLoggedIn,upload.single('image'),apicontroller.updateproduct);

router.get('/products',apicontroller.allproducts);


function isLoggedIn(req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/admin');
}

function isLoggedOut(req, res, next) {
    req.isAuthenticated() ? res.redirect('/dashboard') : next();
}

module.exports = router;