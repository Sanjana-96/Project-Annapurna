const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models/db');

// =====================
// REGISTER
// =====================
router.get('/register', (req, res) => {
    res.render('auth/register');
});

router.post('/register', async (req, res) => {
    const { username, email, password, role, contact } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (username, email, password, role, contact_number) VALUES ($1, $2, $3, $4, $5)',
            [username, email, hashedPassword, role, contact]
        );

        req.flash('success', 'Registration successful. Please login.');
        res.redirect('/login');
    } catch (err) {
        console.error("Registration error:", err);
        req.flash('error', 'Error registering user. ' + (err.detail || ''));
        res.redirect('/register');
    }
});

// =====================
// LOGIN
// =====================
router.get('/login', (req, res) => {
    res.render('auth/login');
});

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

        // ✅ Save session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            contact_number: user.contact_number
        };

        console.log("✅ Session created:", req.session.user);

        // Redirect by role
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

// =====================
// LOGOUT
// =====================
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Logout error:", err);
            req.flash('error', 'Error logging out.');
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // ✅ ensure cookie removed
        res.redirect('/');
    });
});

module.exports = router;
