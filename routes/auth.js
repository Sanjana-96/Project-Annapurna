const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models/db');

// Register page
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Handle register
router.post('/register', async (req, res) => {
    const { username, email, password, role, contact } = req.body; // ✅ match EJS field (contact)

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (username, email, password, role, contact_number) VALUES ($1, $2, $3, $4, $5)',
            [username, email, hashedPassword, role, contact] // ✅ use contact here
        );
        req.flash('success', 'Registration successful. Please login.');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error registering user. ' + (err.detail || ''));
        res.redirect('/register');
    }
});

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Handle login
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
//         const user = result.rows[0];
//         console.log("DB returned user:", user);

//         if (!user) {
//             req.flash('error', 'No user found with this email.');
//             return res.redirect('/login');
//         }

//         const match = await bcrypt.compare(password, user.password);
//         if (!match) {
//             req.flash('error', 'Invalid password.');
//             return res.redirect('/login');
//         }

//         // Save session (include contact_number)
//         req.session.user = { 
//             id: user.id, 
//             name: user.username, 
//             role: user.role, 
//             contact_number: user.contact_number 
//         };

//         req.session.save(err => {
//             if (err) {
//                 console.error("Session save error:", err);
//                 req.flash('error', 'Session error. Try again.');
//                 return res.redirect('/login');
//             }

//             // Redirect based on role
//             if (user.role === 'admin') {
//                 return res.redirect('/admin/dashboard');
//             } else if (user.role === 'donor') {
//                 return res.redirect('/donor/dashboard');
//             } else if (user.role === 'receiver') {
//                 return res.redirect('/receiver/dashboard');
//             } else {
//                 req.flash('error', 'Invalid role.');
//                 return res.redirect('/login');
//             }
//         });

//     } catch (err) {
//         console.error("Login error:", err);
//         req.flash('error', 'Login failed.');
//         res.redirect('/login');
//     }
// });
// Handle login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
        const user = result.rows[0];
        console.log("DB returned user:", user);

        if (!user) {
            req.flash('error', 'No user found with this email.');
            return res.redirect('/login');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.flash('error', 'Invalid password.');
            return res.redirect('/login');
        }

        // ✅ Save session (use consistent key names)
        req.session.user = {
            id: user.id,
            username: user.username,   // <-- use "username" not "name"
            email: user.email,
            role: user.role,
            contact_number: user.contact_number
        };

        console.log("✅ Logged in user saved in session:", req.session.user);

        // ✅ No need for req.session.save() unless you want callback
        // Redirect based on role
        if (user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else if (user.role === 'donor') {
            return res.redirect('/donor/dashboard');
        } else if (user.role === 'receiver') {
            return res.redirect('/receiver/dashboard');
        } else {
            req.flash('error', 'Invalid role.');
            return res.redirect('/login');
        }

    } catch (err) {
        console.error("Login error:", err);
        req.flash('error', 'Login failed.');
        res.redirect('/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;
