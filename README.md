# 📰 NewsNest - CityWise News Portal

**NewsNest** is a full-featured Node.js web app that delivers **city-specific news headlines** from across India using a real-time **news API**. Built with Express and Handlebars, it includes login/signup, favorites, search history, and user dashboard.

---

## 🌐 Live Site

🚀 Live Website: [https://newsnest-szje.onrender.com](https://newsnest-szje.onrender.com/)  

🔗 GitHub: [github.com/sulabhsaluja/NewsNest](https://github.com/sulabhsaluja/NewsNest)

---

## 📌 Features

* 🔍 Search for news by **Indian city**
* 📚 **Search history** saved and displayed per user
* ❤️ Save articles as **favorites**
* 🧾 View your previously **saved news**
* 🧑‍💻 Full **authentication** system (Login/Signup)
* 🗂️ Organized routing and modular file structure

---

## 🧱 Tech Stack

| Tech       | Description                     |
| ---------- | ------------------------------- |
| Node.js    | Backend runtime                 |
| Express.js | Web framework                   |
| Handlebars | View templating engine (`.hbs`) |
| MongoDB    | MongoDB Atlas - `NewsNest` DB   |
| Axios      | API requests to news provider   |
| dotenv     | API key configuration           |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sulabhsaluja/NewsNest.git
cd NewsNest
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up `.env`

Create a `.env` file in the root with:

```env
MONGODB_URI=mongodb+srv://<your-user>:<your-pass>@<cluster>.mongodb.net/NewsNest?retryWrites=true&w=majority&appName=jobPortalCluster
NEWS_API_KEY=your_newsdata_api_key
```

> ✅ Make sure the database name is `NewsNest` and user has read/write access.

### 4. Run the app

```bash
node server.js
```

Visit: [http://localhost:3001](http://localhost:3001)

---

## 📁 Folder Structure

```
NewsNest/
│
├── middleware/                # Auth middlewares
│   └── auth.js
│
├── models/                    # Mongoose schemas
│   ├── FavoriteCity.js
│   ├── SavedNews.js
│   ├── SearchHistory.js
│   └── User.js
│
├── public/
│   └── css/
│       └── style.css          # Custom styling
│
├── routes/                    # Route handlers
│   └── auth.js
│
├── views/                     # HBS Templates
│   ├── layouts/
│   │   └── main.hbs
│   ├── dashboard.hbs
│   ├── favorites.hbs
│   ├── history.hbs
│   ├── index.hbs
│   ├── login.hbs
│   ├── results.hbs
│   ├── saved.hbs
│   └── signup.hbs
│
├── .env
├── package.json
├── server.js                 # Main entry file
```

---

## 📡 API Integration

Using [NewsData.io](https://newsdata.io/) API:

**Sample Endpoint:**

```url
https://newsdata.io/api/1/news?q=kanpur&country=in&language=en&apikey=YOUR_API_KEY
```

---

## 🔐 Authentication Features

* 🔒 Login / Signup using email and password
* 🧠 Search history saved per user
* ❤️ Save favorite news per user

---

## 💡 Future Add-ons

* 🔔 Push notifications for saved topics
* 🌐 Language switch (Hindi ↔ English)
* 📱 Mobile-first responsive design
* 🔎 Auto-suggest cities from list

---

## ✍️ Author

Made by **Sulabh**

> A full-stack project built with real-time API & MongoDB integration.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
