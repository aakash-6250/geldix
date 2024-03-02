const passport = require('passport');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const upload = require('./multer')
const fs = require('fs');


const apicontroller = {};

const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(Admin.authenticate()));



// Register API
apicontroller.register = async (req, res) => {
    try {
        const { username, fullname, password, secretKey } = req.body;

        const environmentSecretKey = process.env.ADMIN_SECRET_KEY;
        if (secretKey !== environmentSecretKey) {
            return res.status(401).json({ status: false, message: 'Invalid secret key' });
        }

        const existingUser = await Admin.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ status: false, message: 'Username is already taken' });
        }

        const newUser = new Admin({ username, fullname });
        await newUser.setPassword(password); // Set user password
        await newUser.save();
        res.redirect("/admin");
        //   res.status(201).json({ status:true, message: 'Admin registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};


// Login API
apicontroller.login = async (req, res, next) => {
    try {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: false, message: 'Internal Server Error' });
            }

            if (!user) {
                return res.status(401).json({ status: false, message: 'Invalid credentials' });
            }

            // Log in the user
            req.logIn(user, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ status: false, message: 'Internal Server Error' });
                }
                res.redirect("/dashboard");
                //   res.status(201).json({ status:true, message: 'Admin loggedIn successfully' });
            });
        })(req, res, next);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Logout API
apicontroller.logout = (req, res) => {
    try {
        req.logout();
        res.redirect("/");
        // res.json({status:true, message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// Create Product API
apicontroller.addproduct = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({ status: false, message: 'Image is required' });
        }

        const admin = await Admin.findOne({ username: req.session.passport.user });

        if (!admin) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ status: false, message: 'Admin not found' });
        }

        

        const product = new Product({
            productname: req.body.productname,
            productdescription: req.body.productdescription,
            user: admin._id,
            image: req.file.path
        });

        const result = await product.save();

        res.redirect("/dashboard");

        // res.status(201).json({ status:true, message: 'Product created successfully' });
    } catch (err) {
        console.error(err);
        fs.unlinkSync(req.file.path);
        res.status(500).json({ status:false, message: err.message });
    }
};

// Update Product API
apicontroller.updateproduct = async (req, res) => {
    try {
        const {id}= req.params;
        const { productname, productdescription } = req.body;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }

        if(product.image){
            fs.unlinkSync(product.image);
        }

        if (productname) product.productname = productname;
        if (productdescription) product.productdescription = productdescription;
        if (req.file) product.image = req.file.path;

        const updatedProduct = await product.save();

        res.redirect("/dashboard");

        // res.json({ status: true, message: 'Product updated successfully'});
    } catch (error) {
        res.status(500).json({status:false, message: error.message });
    }
};

// Delete Product API
apicontroller.deleteproduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get All Products API
apicontroller.allproducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = apicontroller;
