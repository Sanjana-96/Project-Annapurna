const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const pgSession = require('connect-pg-simple')(session);
const db = require('./models/db');  // ✅ reuse your db.js
const app = express();

Session (only once!)
app.use(session({
    store: new pgSession({ pool: db }),
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production', // ✅ secure only in prod
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));const session = require('express-session');


// Middleware
app.use(express.json()); // ✅ parse JSON
app.use(express.urlencoded({ extended: true })); // ✅ parse form data
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.set('view engine', 'ejs');

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

// app.get('/', (req, res) => {
//     if (req.session.user) {
//         return res.redirect(
//             req.session.user.role === 'donor'
//                 ? '/donor/dashboard'
//                 : '/receiver/dashboard'
//         );
//     }
//     res.render('index');
// });
app.get('/', (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else if (req.session.user.role === 'donor') {
            return res.redirect('/donor/dashboard');
        } else if (req.session.user.role === 'receiver') {
            return res.redirect('/receiver/dashboard');
        }
    }
    res.render('index');
});


app.get('/about', (req, res) => res.render('about'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
