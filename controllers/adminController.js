const passport = require('passport');
const User = require('../models/Admin');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(User.authenticate()));

const adminController = {};

// Register a new admin
adminController.registerAdmin = async (req, res) => {
  try {
    const { username, fullname, password, secretKey } = req.body;

    // Check if the secret key matches the one set in the environment variables
    const environmentSecretKey = process.env.ADMIN_SECRET_KEY;
    if (secretKey !== environmentSecretKey) {
      return res.status(401).json({ error: 'Invalid secret key' });
    }

    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Create a new admin user
    const newUser = new User({ username, fullname });
    await newUser.setPassword(password); // Set user password
    await newUser.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Login admin
adminController.loginAdmin = async (req, res, next) => {
  try {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Log in the user
      req.logIn(user, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ message: 'Login successful', user });
      });
    })(req, res, next);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Logout admin
adminController.logoutAdmin = (req, res, next) => {
  try {
    req.logout((err) => {
      if(err) return next();
    });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = adminController;