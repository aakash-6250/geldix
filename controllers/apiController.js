const passport = require('passport');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Category = require('../models/Category');
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
        res.status(200).json({ status: true, message: 'User registered successfully' }).redirect;
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

        if (!req.body.category) {
            return res.status(400).json({ status: false, message: 'Product category is required' });
        }

        const { name, description, category } = req.body;

        try {
            const admin = await Admin.findOne({ username: req.session.passport.user });
            if (!admin) {
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ status: false, message: 'Admin not found' });
            }

            let existingCategory = await Category.findOne({ name: category });
            if (!existingCategory) {
                existingCategory = new Category({ name: category, products: [] });
            }

            const imageFilename = req.file.filename.split('.')[0];
            const finalImagePath = path.join(__dirname, '../', 'public', 'images', 'products', `${imageFilename}.webp`);

            const imageStream = fs.createReadStream(req.file.path);

            const processedImageStream = imageStream.pipe(
                sharp()
                    .rotate()
                    .webp({ quality: 10 })
            );

            const writeStream = fs.createWriteStream(finalImagePath);

            processedImageStream.pipe(writeStream);

            writeStream.on('close', async () => {
                fs.unlinkSync(req.file.path);

                const product = new Product({
                    name: name,
                    description: description,
                    category: existingCategory._id,
                    categoryname: category,
                    user: admin.fullname,
                    image: `/images/products/${imageFilename}.webp`
                });

                await product.save();

                existingCategory.products.push(product);
                await existingCategory.save();

                res.status(200).json({ status: true, message: 'Product added successfully' });
            });

            writeStream.on('error', (writeErr) => {
                console.error('Error writing processed image:', writeErr);
                fs.unlinkSync(req.file.path);
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
            const { name, description, category } = req.body;

            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({ status: false, message: 'Product not found' });
            }

            let categoryChanged = false;
            if (category && product.category.toString() !== category) {
                categoryChanged = true;
            }

            if (!name && !description && !category && !req.file) {
                return res.status(400).json({ status: false, message: 'No update data provided' });
            }


            if (name) product.name = name;
            if (description) product.description = description;

            if (categoryChanged) {
                const previousCategory = await Category.findById(product.category);
                if (previousCategory) {
                    previousCategory.products.pull(product._id);
                    if (previousCategory.products.length === 0) {
                        await Category.findByIdAndDelete(previousCategory._id);
                    } else {
                        await previousCategory.save();
                    }
                }

                let existingCategory = await Category.findOne({ name: category });
                if (!existingCategory) {
                    existingCategory = new Category({ name: category, products: [product._id] });
                    await existingCategory.save();
                }
                else {
                    existingCategory.products.push(product._id);
                    await existingCategory.save();
                }
                product.category = existingCategory._id;
                product.categoryname = category;
            }

            if (req.file) {
                const imageFilename = req.file.filename.split('.')[0];
                const finalImagePath = path.join(__dirname, '../', 'public', 'images', 'products', `${imageFilename}.webp`);

                const imageStream = fs.createReadStream(req.file.path);
                const processedImageStream = imageStream.pipe(
                    sharp()
                        .rotate()
                        .webp({ quality: 10 })
                );

                const writeStream = fs.createWriteStream(finalImagePath);

                processedImageStream.pipe(writeStream);

                writeStream.on('close', async () => {
                    fs.unlinkSync(req.file.path);
                    fs.unlinkSync(path.join(__dirname, '../', 'public', product.image));
                    product.image = `/images/products/${imageFilename}.webp`;

                    await product.save();



                    res.status(200).json({ status: true, message: 'Product updated successfully' });
                });

                writeStream.on('error', (writeErr) => {
                    console.error('Error writing processed image:', writeErr);
                    fs.unlinkSync(req.file.path);
                    res.status(500).json({ status: false, message: 'Error writing processed image' });
                });
            } else {
                await product.save();
                res.status(200).json({ status: true, message: 'Product updated successfully' });
            }
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    });
};


apiController.deleteproduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        const category = await Category.findById(product.category);
        category.products.pull(product._id);
        if (category.products.length === 0) {
            await Category.findByIdAndDelete(category._id);
        } else {
            await category.save();
        }
        fs.unlinkSync(path.join(__dirname, "../", "public", product.image));
        await Product.findByIdAndDelete(id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

apiController.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        if (products) res.status(200).json(products);
        else res.status(404).json({ message: 'No products found' });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

apiController.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        if (categories) res.status(200).json(categories);
        else res.status(404).json({ message: 'No categories found' });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

apiController.getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id)
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

apiController.getProductsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category: category });
        if (products) res.status(200).json(products);
        else res.status(404).json({ message: 'No products found' });
    }
    catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

apiController.getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (err) {
        console.error('Error fetching category by ID:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = apiController;
