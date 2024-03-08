const express = require('express');
const router = express.Router();
const apicontroller = require('../controllers/apicontroller');
const upload = require('../controllers/multer');



router.post('/login',isLoggedOut, apicontroller.login);

router.post('/register',isLoggedOut, apicontroller.register);

router.post('/logout', isLoggedIn,apicontroller.logout);

router.post('/add',isLoggedIn,upload.single('image'),apicontroller.addproduct);

router.get('/add',(req,res,next)=>{
    res.send("hello");
});

router.post('/delete/:id', isLoggedIn,apicontroller.deleteproduct);

router.post('/update/:id', isLoggedIn,upload.single('image'),apicontroller.updateproduct);

router.get('/products',apicontroller.allproducts);

router.get('/product/:id', apicontroller.getProductById);

function isLoggedIn(req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/admin');
}

function isLoggedOut(req, res, next) {
    req.isAuthenticated() ? res.redirect('/dashboard') : next();
}

module.exports = router;