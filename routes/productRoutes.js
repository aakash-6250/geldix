const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../controllers/multer'); 

// Create a new product
router.post('/products',isLoggedIn, upload.single('image'), productController.createProduct);


// Get product by ID
router.get('/products/:productId', productController.getProductById);

// Update product by ID
router.patch('/products/:productId',isLoggedIn, productController.updateProductById);

// Delete product by ID
router.delete('/products/:productId', isLoggedIn,productController.deleteProductById);



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

module.exports = router;