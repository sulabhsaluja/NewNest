const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Signup page
router.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.send('Signup failed');
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.send('Invalid credentials');
    }

    req.session.userId = user._id;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send('Login failed');
  }
});

module.exports = router;
