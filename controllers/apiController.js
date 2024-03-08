const passport = require('passport');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const upload = require('./multer')
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const apicontroller = {};
const {v4: uuidv4} = require("uuid");
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

// Add Product API
apicontroller.addproduct = async (req, res) => {
    try {
        const reqfile = req.file.path;

        if (!reqfile) {
            return res.status(400).json({ status: false, message: 'Image is required' });
        }

        const admin = await Admin.findOne({ username: req.session.passport.user });

        if (!admin) {
            await fs.promises.unlink(reqfile); // Handle file deletion asynchronously
            return res.status(404).json({ status: false, message: 'Admin not found' });
        }

        const imagepath = path.dirname(reqfile);
        const uniquename = uuidv4();
        const finalimagepath = path.join(imagepath, uniquename + ".webp");

        // Use sharp async/await syntax to process the image
        await sharp(reqfile)
            .rotate()
            .toFile(finalimagepath);

        const product = new Product({
            productname: req.body.productname,
            productdescription: req.body.productdescription,
            user: admin.fullname,
            image: finalimagepath
        });

        // Delete the uploaded file after processing
        await fs.promises.unlink(reqfile);

        await product.save();

        res.redirect("/dashboard");
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
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

        await product.save();

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
        const prod=await Product.findByIdAndDelete(id);
        console.log(prod.image);
        fs.unlinkSync(prod.image);
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

apicontroller.getProductById = async (req, res) => {
    try {
      const id = req.params.id;
      const product = await Product.findById(id).populate('user', 'fullname').exec();
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };

module.exports = apicontroller;
