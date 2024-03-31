const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  categoryname: { type: String, required: true },
  user:{ type: String, required: true },
  createdAt:{ type: Date, default: Date.now() },
  image:{ type: String , required: true} 
});

module.exports = mongoose.model('Product', productSchema);