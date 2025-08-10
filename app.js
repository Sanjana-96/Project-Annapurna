// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const app = express();

const pool = new Pool({
    user: 'postgres',
    host: process.env.DB_HOST,
    database: 'annapurna',
    password: 'Sanju@2004',
    port: process.env.DB_PORT,
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'someRandomSecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }  // change to true if using HTTPS
}));


app.use(session({
     store: new pgSession({ pool }),
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // keep false for localhost
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

// Middleware

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Flash & locals

app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.user = req.session.user;
    next();
});
// Debug session logging
app.use((req, res, next) => {
    console.log("Session user:", req.session.user);
    next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/donor', require('./routes/donor'));
app.use('/receiver', require('./routes/receiver'));

app.get('/', (req, res) => {
    if (req.session.user) {
        // Redirect based on role
        return res.redirect(req.session.user.role === 'donor' ? '/donor/dashboard' : '/receiver/dashboard');
    }
    res.render('index'); // Create a simple home.ejs page
});
app.get('/about', (req, res) => {
  res.render('about');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));








// sanjanakondala52@gmail.com password:2004
// b522029@iiit-bh.ac.in password:1234
//chatgpt@gmail.com password:1357
//wearehappy@gmail.com password:0123
