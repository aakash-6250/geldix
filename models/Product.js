const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  user:{ type: String, required: true },
  createdAt:{ type: Date, default: Date.now() },
  image:{ type: String , require: true} 
});

module.exports = mongoose.model('Product', productSchema);