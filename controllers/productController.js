const mongoose = require('mongoose');
const Product = require('../models/Product');
const Admin=require('../models/Admin')
const upload=require('./multer')

exports.createProduct = async (req, res) => {


  try {

    upload.single(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        res.send(err);
      } else if (err) {
        res.send(err);
      }
  
    })

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }


    const tempAdmin = await Admin.findOne({ username: req.session.passport.user });

    const product = new Product({
      productname: req.body.productname,
      productdescription: req.body.productdescription,
      user: tempAdmin._id,
      image: req.file.path
    });

    const result = await product.save();
    res.status(201).json({ message: 'Product created successfully', product: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('user', 'fullname').exec();
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const id = req.params.productId;
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

exports.updateProductById = async (req, res) => {
  try {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value;
    }
    await Product.updateOne({ _id: id }, { $set: updateOps }).exec();
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProductById = async (req, res) => {
  try {
    const id = req.params.productId;
    await Product.deleteOne({ _id: id }).exec();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
