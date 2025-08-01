const express = require('express');
const router = express.Router();
const db = require('../models/db');

// ===== Middleware: Only allow logged-in receivers =====
router.use((req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'receiver') {
        req.flash('error', 'You must be logged in as a receiver.');
        return res.redirect('/login');
    }
    next();
});

// ===== Receiver Dashboard (Browse Food) =====
router.get('/dashboard', async (req, res) => {
    try {
        console.log("Fetching food for receiver:", req.session.user.id);
        const food = await db.query(
            `SELECT f.*, u.username AS donor_name, u.email AS donor_email 
             FROM food_items f
             JOIN users u ON f.donor_id = u.id
             WHERE (f.expiry_time IS NULL OR f.expiry_time > NOW())
             ORDER BY f.created_at DESC`
        );
        return res.render('receiver/dashboard', { food: food.rows });
    } catch (err) {
        console.error("Error fetching food:", err);
        req.flash('error', 'Error loading available food.');
        return res.redirect('/');
    }
});

// ===== Request Food =====
router.post('/request/:id', async (req, res) => {
    const food_id = req.params.id;
    const receiver_id = req.session.user.id;

    try {
        // Check if already requested
        const existing = await db.query(
            'SELECT * FROM requests WHERE food_id = $1 AND receiver_id = $2',
            [food_id, receiver_id]
        );

        if (existing.rows.length > 0) {
            req.flash('error', 'You have already requested this item.');
            return res.redirect('/receiver/dashboard');
        }

        // Explicitly set status as 'pending'
        await db.query(
            'INSERT INTO requests (food_id, receiver_id, status) VALUES ($1, $2, $3)',
            [food_id, receiver_id, 'pending']
        );
        req.flash('success', 'Request sent to the donor!');
        return res.redirect('/receiver/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error requesting food.');
        return res.redirect('/receiver/dashboard');
    }
});

// ===== View Receiver Request History =====
router.get('/requests', async (req, res) => {
    try {
        const requests = await db.query(
            `SELECT r.id, r.status, r.created_at,
                    f.title, f.description, f.location, f.image, f.expiry_time, 
                    u.username AS donor_name, u.email AS donor_email
             FROM requests r
             JOIN food_items f ON r.food_id = f.id
             JOIN users u ON f.donor_id = u.id
             WHERE r.receiver_id = $1
             ORDER BY r.created_at DESC`,
            [req.session.user.id]
        );

        console.log("Receiver Requests:", requests.rows); // <-- DEBUG LOG

        res.render('receiver/requests', { requests: requests.rows });
    } catch (err) {
        console.error("Error loading receiver requests:", err);
        req.flash('error', 'Error loading your requests.');
        return res.redirect('/receiver/dashboard');
    }
});

module.exports = router;
