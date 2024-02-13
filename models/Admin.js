const mongoose = require('mongoose');
const plm= require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  fullname: { type: String, required: true },
  password: String, 
  products: [{ type: mongoose.Schema.Types.ObjectId, ref:'Product'}],
  role: { type: String, enum: ['admin'], default: 'admin' }  
});

userSchema.plugin(plm);

module.exports = mongoose.model('Admin', userSchema);