require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit'); // For rate limiting
const cors = require('cors'); // For CORS support

const User = require('./models/User');
const SavedNews = require('./models/SavedNews');
const SearchHistory = require('./models/SearchHistory');
const FavoriteCity = require('./models/FavoriteCity');
const requireLogin = require('./middleware/auth');

const authRoutes = require('./routes/auth'); // Make sure path is correct

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ Connection error:', err));

// Middleware setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view options', { layout: 'layouts/main' });

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many login attempts, please try again later."
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey', // Use environment variable
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// CORS support (if needed)
app.use(cors());

// Routes
app.use('/', authRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/news', async (req, res) => {
  const city = req.body.city.trim();
  const inputDate = req.body.date.trim(); // dd-mm-yyyy or dd/mm/yyyy
  const apiKey = process.env.GNEWS_API_KEY;

  // Convert dd-mm-yyyy or dd/mm/yyyy → yyyy-mm-dd
  const parts = inputDate.includes('-') ? inputDate.split('-') : inputDate.split('/');
  if (parts.length !== 3) {
    return res.send("❌ Invalid date format. Please use dd-mm-yyyy.");
  }

  const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // yyyy-mm-dd

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(city)}&lang=en&country=in&from=${formattedDate}&to=${formattedDate}&token=${apiKey}`;

  try {
    const response = await axios.get(url);

    const filteredArticles = (response.data.articles || []).filter(article =>
      (article.title && article.title.toLowerCase().includes(city.toLowerCase())) ||
      (article.description && article.description.toLowerCase().includes(city.toLowerCase())) ||
      (article.content && article.content.toLowerCase().includes(city.toLowerCase()))
    );

    if (req.session.userId) {
      await SearchHistory.create({ userId: req.session.userId, city });
    }

    res.render('results', {
      city,
      date: formattedDate,
      articles: filteredArticles.map(a => ({
        title: a.title,
        link: a.url
      }))
    });

  } catch (err) {
    console.error("GNews API error:", err.message);
    res.send("❌ GNews API error: " + (err.response?.data?.message || err.message));
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
app.get('/dashboard', requireLogin, async(req, res) => {
  const user = await User.findById(req.session.userId);
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3001, () => {
  console.log('Server started at http://localhost:3001');
});
