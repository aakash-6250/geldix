const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Register a new admin
router.post('/register',requireLoggedOut, adminController.registerAdmin);

// Login admin
router.post('/login',requireLoggedOut, adminController.loginAdmin);

// Logout admin
router.post('/logout', isLoggedIn,adminController.logoutAdmin);


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.render('login');
};

function requireLoggedOut(req, res, next) {
  if (req.isAuthenticated()) {
      return res.render('logout');
  }
  next();
}

module.exports = router;