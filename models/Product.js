const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productname: { type: String, required: true },
  productdescription: { type: String, required: true },
  user:{ type: String, required: true },
  createdAt:{ type: Date, default: Date.now() },
  image:{ type: String , require: true} 
});

module.exports = mongoose.model('Product', productSchema);