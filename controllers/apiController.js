const passport = require('passport');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const upload = require('./multer')
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const apicontroller = {};
const { v4: uuidv4 } = require("uuid");
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(Admin.authenticate()));


const apiController = {};

apiController.register = async (req, res, next) => {
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
        await newUser.setPassword(password);
        await newUser.save();
        res.status(200).json({ status: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};


apiController.login = async (req, res, next) => {
    try {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.status(500).json({ status: false, message: 'Internal Server Error' });
            }

            if (!user) {
                return res.status(401).json({ status: false, message: 'Invalid credentials' });
            }

            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).json({ status: false, message: 'Internal Server Error' });
                }
                res.status(200).json({ status: true, message: 'Login successful' });
            });
        })(req, res, next);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};


apiController.logout = (req, res, next) => {
    try {
        req.logout(function (err) {
            if (err) {
                console.error('Error logging out:', err);
                return res.status(500).json({ status: false, message: 'Internal Server Error' });
            }
        });
        res.status(200).json({ status: true, message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};


apiController.addproduct = async (req, res, next) => {
    upload(req, res, async function (err) {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).json({ status: false, message: 'Internal Server Error' });
        }

        if (!req.file) {
            return res.status(400).json({ status: false, message: 'Product image is required' });
        }

        if (!req.body.name) {
            return res.status(400).json({ status: false, message: 'Product name is required' });
        }

        if (!req.body.description) {
            return res.status(400).json({ status: false, message: 'Product description is required' });
        }

        const { name, description } = req.body;

        try {
            const admin = await Admin.findOne({ username: req.session.passport.user });
            if (!admin) {
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ status: false, message: 'Admin not found' });
            }

            const imageFilename = req.file.filename.split('.')[0];
            const finalImagePath = path.join(__dirname, '../', 'public', 'images', 'products', `${imageFilename}.webp`);

            const imageStream = fs.createReadStream(req.file.path);

            // Process the image with sharp using a stream
            const processedImageStream = imageStream.pipe(
                sharp()
                    .rotate()
                    .webp({ quality: 10 })
            );

            const writeStream = fs.createWriteStream(finalImagePath);

            processedImageStream.pipe(writeStream);

            // When the processing is finished, close the write stream
            writeStream.on('close', async () => {
                // Delete the temporary file after processing
                fs.unlinkSync(req.file.path);

                const product = new Product({
                    name: name,
                    description: description,
                    user: admin.fullname,
                    image: `/public/images/products/${imageFilename}.webp`
                });

                await product.save();

                res.status(200).json({ status: true, message: 'Product added successfully' });
            });

            // Handle errors
            writeStream.on('error', (writeErr) => {
                console.error('Error writing processed image:', writeErr);
                fs.unlinkSync(req.file.path); // Delete the temporary file
                res.status(500).json({ status: false, message: 'Error writing processed image' });
            });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    });
};
apiController.updateproduct = async (req, res, next) => {
    upload(req, res, async function (err) {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).json({ status: false, message: 'Internal Server Error' });
        }

        try {
            const { id } = req.params;
            const { productname, productdescription } = req.body;

            const product = await Product.findById(id);

            if (!product) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({ status: false, message: 'Product not found' });
            }

            if (!productname && !productdescription && !req.file) {
                return res.status(400).json({ status: false, message: 'No update data provided' });
            }

            if (productname) product.name = productname;
            if (productdescription) product.description = productdescription;

            if (req.file) {
                const reqfile = req.file.path;
                const imagepath = path.dirname(reqfile);
                const uniquename = uuidv4();
                const finalimage = path.join(imagepath, uniquename + ".webp");

                await sharp(reqfile)
                    .rotate()
                    .toFile(finalimage);

                fs.unlinkSync(product.image); // Remove the old image
                product.image = finalimage;

                fs.unlinkSync(reqfile); // Remove the temporary uploaded image
            }

            await product.save();

            res.status(200).json({ status: true, message: 'Product updated successfully' });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    });
};

apiController.deleteproduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const prod = await Product.findByIdAndDelete(id);
        fs.unlinkSync(path.join(__dirname, "../", prod.image));
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

apiController.allproducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        if (products.length > 0) {
            res.status(200).json(products);
        } else {
            res.status(404).json({ message: 'No products found' });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

apiController.getProductById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id).populate('user', 'fullname').exec();
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        console.error('Error fetching product by ID:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = apiController;
