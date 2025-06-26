// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');

// // Signup page
// router.get('/signup', (req, res) => {
//   res.render('signup');
// });

// // Handle signup
// router.post('/signup', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const user = new User({ name, email, password });
//     await user.save();
//     res.redirect('/login');
//   } catch (err) {
//     console.error(err);
//     res.send('Signup failed');
//   }
// });

// // Login page
// router.get('/login', (req, res) => {
//   res.render('login');
// });

// // Handle login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await user.comparePassword(password))) {
//       return res.send('Invalid credentials');
//     }

//     req.session.userId = user._id;
//     res.redirect('/');
//   } catch (err) {
//     console.error(err);
//     res.send('Login failed');
//   }
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware: redirect if already logged in
function redirectIfAuthenticated(req, res, next) {
  if (req.session.userId) return res.redirect('/dashboard');
  next();
}

// Signup page
router.get('/signup', redirectIfAuthenticated, (req, res) => {
  res.render('signup');
});

// Handle signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    req.flash('success', 'Signup successful! Please login.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Signup failed. Try again.');
    res.redirect('/signup');
  }
});

// Login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login');
});

// Handle login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    req.session.userId = user._id;
    req.session.userName = user.name;
    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Login failed. Try again.');
    res.redirect('/login');
  }
});

module.exports = router;
