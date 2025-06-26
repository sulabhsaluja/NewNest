require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const User = require('./models/User');
const SavedNews = require('./models/SavedNews');
const SearchHistory = require('./models/SearchHistory');
const FavoriteCity = require('./models/FavoriteCity');
const requireLogin = require('./middleware/auth');

const authRoutes = require('./routes/auth');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ Connection error:', err));

// View Engine & Middleware
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layouts/main' });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Rate Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many login attempts, please try again later."
});

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

const flash = require('connect-flash');
app.use(flash());
// After app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

// Session Middleware for Templates
app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.userName = req.session.userName || null;
  next();
});

// Routes
app.use('/', authRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/news', async (req, res) => {
  const city = req.body.city.trim();
  const apiKey = process.env.NEWSDATA_API_KEY;
  const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(city)}&country=in&language=en`;

  try {
    const response = await axios.get(url);
    if (req.session.userId) {
      await SearchHistory.create({ userId: req.session.userId, city });
    }
    res.render('results', { city, articles: response.data.results || [] });
  } catch (err) {
    console.error("API error:", err);
    res.send('API error: ' + (err.response?.data?.message || err.message));
  }
});

app.post('/save-news', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const { title, link } = req.body;
  await SavedNews.create({ userId: req.session.userId, title, link });
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Dashboard
app.get('/dashboard', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  req.session.userName = user.name; // Update name in session (optional redundancy)
  res.render('dashboard', { userName: user.name });
});

// Saved News
app.get('/saved', requireLogin, async (req, res) => {
  const news = await SavedNews.find({ userId: req.session.userId });
  res.render('saved', { news });
});

// Search History
app.get('/history', requireLogin, async (req, res) => {
  const history = await SearchHistory.find({ userId: req.session.userId }).sort({ searchedAt: -1 });
  res.render('history', { history });
});

// Favorite Cities
app.get('/favorites', requireLogin, async (req, res) => {
  const cities = await FavoriteCity.find({ userId: req.session.userId });
  res.render('favorites', { cities });
});

app.post('/favorites', requireLogin, async (req, res) => {
  const { city } = req.body;
  await FavoriteCity.create({ userId: req.session.userId, city });
  res.redirect('/favorites');
});

app.post('/favorites/delete', requireLogin, async (req, res) => {
  const { city } = req.body;
  await FavoriteCity.deleteOne({ userId: req.session.userId, city });
  res.redirect('/favorites');
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3001, () => {
  console.log('Server started at http://localhost:3001');
});
