require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const flash = require('connect-flash');

const User = require('./models/User');
const SavedNews = require('./models/SavedNews');
const SearchHistory = require('./models/SearchHistory');
const FavoriteCity = require('./models/FavoriteCity');
const requireLogin = require('./middleware/auth');

const authRoutes = require('./routes/auth');

const app = express();

// Trust proxy for HTTPS in production
app.set('trust proxy', 1);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// View Engine & Middleware
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layouts/main' });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later"
});
app.use(limiter);

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60, // 1 day
    autoRemove: 'native' // automatically remove expired sessions
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Flash messages
app.use(flash());

// Global template variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.userName = req.session.userName || null;
  res.locals.currentUrl = req.originalUrl;
  next();
});

// Routes
app.use('/', authRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index', {
    title: 'NewsNest - City News Finder',
    isHome: true
  });
});

// News search route
app.post('/news', async (req, res) => {
  try {
    const city = req.body.city.trim();
    if (!city) {
      req.flash('error', 'Please enter a city name');
      return res.redirect('/');
    }

    const apiKey = process.env.NEWSDATA_API_KEY;
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(city)}&country=in&language=en`;

    const response = await axios.get(url);
    const articles = response.data.results || [];

    if (req.session.userId) {
      await SearchHistory.create({ 
        userId: req.session.userId, 
        city,
        resultsCount: articles.length
      });
    }

    res.render('results', {
      title: `News for ${city}`,
      city,
      articles,
      hasResults: articles.length > 0
    });
  } catch (err) {
    console.error("News API error:", err);
    req.flash('error', 'Failed to fetch news. Please try again.');
    res.redirect('/');
  }
});

// Save news route
app.post('/save-news', requireLogin, async (req, res) => {
  try {
    const { title, link } = req.body;
    await SavedNews.create({ 
      userId: req.session.userId, 
      title, 
      link,
      savedAt: new Date()
    });
    req.flash('success', 'Article saved successfully');
  } catch (err) {
    console.error("Save error:", err);
    req.flash('error', 'Failed to save article');
  }
  res.redirect('back');
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/');
  });
});

// Dashboard route
app.get('/dashboard', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/logout');
    }
    
    req.session.userName = user.name;
    res.render('dashboard', { 
      title: 'Your Dashboard',
      userName: user.name 
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.redirect('/');
  }
});

// Saved news route
app.get('/saved', requireLogin, async (req, res) => {
  try {
    const news = await SavedNews.find({ userId: req.session.userId })
      .sort({ savedAt: -1 });
    res.render('saved', { 
      title: 'Saved Articles',
      news,
      hasSaved: news.length > 0
    });
  } catch (err) {
    console.error("Saved news error:", err);
    res.redirect('/dashboard');
  }
});

// Search history route
app.get('/history', requireLogin, async (req, res) => {
  try {
    const history = await SearchHistory.find({ userId: req.session.userId })
      .sort({ searchedAt: -1 })
      .limit(20);
    res.render('history', { 
      title: 'Search History',
      history,
      hasHistory: history.length > 0
    });
  } catch (err) {
    console.error("History error:", err);
    res.redirect('/dashboard');
  }
});

// Favorite cities routes
app.get('/favorites', requireLogin, async (req, res) => {
  try {
    const cities = await FavoriteCity.find({ userId: req.session.userId })
      .sort({ createdAt: -1 });
    res.render('favorites', { 
      title: 'Favorite Cities',
      cities,
      hasFavorites: cities.length > 0
    });
  } catch (err) {
    console.error("Favorites error:", err);
    res.redirect('/dashboard');
  }
});

app.post('/favorites', requireLogin, async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      req.flash('error', 'Please enter a city name');
      return res.redirect('/favorites');
    }

    await FavoriteCity.create({ 
      userId: req.session.userId, 
      city,
      createdAt: new Date()
    });
    req.flash('success', 'City added to favorites');
  } catch (err) {
    console.error("Add favorite error:", err);
    req.flash('error', 'Failed to add city to favorites');
  }
  res.redirect('/favorites');
});

app.post('/favorites/delete', requireLogin, async (req, res) => {
  try {
    const { city } = req.body;
    await FavoriteCity.deleteOne({ 
      userId: req.session.userId, 
      city 
    });
    req.flash('success', 'City removed from favorites');
  } catch (err) {
    console.error("Delete favorite error:", err);
    req.flash('error', 'Failed to remove city from favorites');
  }
  res.redirect('/favorites');
});

// Error Handling
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error' });
});

// Server startup
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Listening on port ${PORT}`);
});