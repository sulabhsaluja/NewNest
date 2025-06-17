
# 📰 NewsNest - CityWise News Portal

**NewsNest** is a full-featured Node.js web app that delivers **city-specific news headlines** from across India using a real-time **news API**. Built with Express and Handlebars, it includes login/signup, favorites, search history, and user dashboard.

---

## 📌 Features

- 🔍 Search for news by **Indian city**
- 📚 **Search history** saved and displayed per user
- ❤️ Save articles as **favorites**
- 🧾 View your previously **saved news**
- 🧑‍💻 Full **authentication** system (Login/Signup)
- 🗂️ Organized routing and modular file structure

---

## 🧱 Tech Stack

| Tech       | Description                     |
|------------|---------------------------------|
| Node.js    | Backend runtime                 |
| Express.js | Web framework                   |
| Handlebars | View templating engine (`.hbs`) |
| MongoDB    | Data storage (Mongoose models)  |
| Axios      | API requests to news provider   |
| dotenv     | API key configuration           |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/sulabhsaluja/newsnest.git
cd newsnest
````

### 2. Install dependencies

```bash
npm install
```

### 3. Set up `.env`

Create a `.env` file in the root with:

```env
MONGODB_URI=your_mongo_uri
NEWS_API_KEY=your_newsdata_api_key
```

### 4. Run the app

```bash
node server.js
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 📁 Folder Structure

```
newsnest/
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

## 💡 Future Add-ons (Ideas)

* 🔔 Push notifications for saved topics
* 🌐 Language switch (Hindi ↔ English)
* 📱 Mobile-first responsive design
* 🔎 Auto-suggest cities from list

---

## ✍️ Author

Made by **Sulabh**

> Full-stack project with real API & MongoDB integration.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).


