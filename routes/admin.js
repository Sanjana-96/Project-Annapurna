const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models/db');


// Show admin registration form
router.get('/register', (req, res) => {
    res.render('admin/register');
});

// Handle admin registration
router.post('/register', async (req, res) => {
    const { username, email, password, secret } = req.body;

    // Secret key check (set this in .env for security)
    if (secret !== process.env.ADMIN_SECRET) {
        req.flash('error', 'Invalid admin registration code.');
        return res.redirect('/admin/register');
    }
    router.use((req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        req.flash('error', 'You must be an admin to access this page.');
        return res.redirect('/login');
    }
    next();
});


    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
            [username, email, hashedPassword, 'admin']
        );
        req.flash('success', 'Admin account created successfully!');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error creating admin account.');
        res.redirect('/admin/register');
    }
});

module.exports = router;
