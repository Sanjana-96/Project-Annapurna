const express = require('express');
const router = express.Router();
const db = require('../models/db');
const multer = require('multer');
const path = require('path');
const sendEmail = require("../utils/sendEmail");

// ===== Multer setup for image upload =====
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/')); // save to /public/uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // unique name
    }
});
const upload = multer({ storage });

// ===== Middleware: Only allow logged-in donors =====
router.use((req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'donor') {
        req.flash('error', 'You must be logged in as a donor.');
        return res.redirect('/login');
    }
    next();
});

// ===== Donor Dashboard =====
router.get('/dashboard', async (req, res) => {
    try {
        
        const food = await db.query('SELECT * FROM food_items WHERE donor_id = $1', [req.session.user.id]);
                const donorId = req.session.user.id;

        // Stats queries
        const totalDonations = await db.query(
            'SELECT COUNT(*) FROM food_items WHERE donor_id = $1', [donorId]
        );
        const totalRequests = await db.query(
            `SELECT COUNT(*) FROM requests r 
             JOIN food_items f ON r.food_id = f.id 
             WHERE f.donor_id = $1`, [donorId]
        );
        const approvedRequests = await db.query(
            `SELECT COUNT(*) FROM requests r 
             JOIN food_items f ON r.food_id = f.id 
             WHERE f.donor_id = $1 AND r.status = 'approved'`, [donorId]
        );
        const requestStatus = await db.query(
    `SELECT status, COUNT(*) 
     FROM requests r 
     JOIN food_items f ON r.food_id = f.id 
     WHERE f.donor_id = $1 
     GROUP BY status`, 
    [donorId]
);
const statusData = { approved: 0, rejected: 0, pending: 0 };
requestStatus.rows.forEach(row => {
    statusData[row.status] = parseInt(row.count);
});

const donationTrends = await db.query(
    `SELECT DATE(created_at) AS date, COUNT(*) 
     FROM food_items 
     WHERE donor_id = $1 
     GROUP BY DATE(created_at) 
     ORDER BY DATE(created_at) ASC`,
    [donorId]
);

const trendLabels = donationTrends.rows.map(row => row.date);
const trendCounts = donationTrends.rows.map(row => parseInt(row.count));

        res.render('donor/dashboard', { 
            food: food.rows,
         totalDonations: totalDonations.rows[0].count,
            totalRequests: totalRequests.rows[0].count,
            approvedRequests: approvedRequests.rows[0].count,
            statusData:JSON.stringify(statusData) ,
            trendLabels: JSON.stringify(trendLabels),
    trendCounts: JSON.stringify(trendCounts)
         });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error loading dashboard.');
        res.redirect('/');
    }
});

// ===== Add Food =====
router.get('/add', (req, res) => {
    res.render('donor/add_food');
});
router.post('/add', upload.single('image'), async (req, res) => {
    const { title, description, quantity, location, expiry_time } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        await db.query(
            'INSERT INTO food_items (donor_id, title, description, quantity, location, expiry_time, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [req.session.user.id, title, description, quantity, location, expiry_time, image]
        );

        // ==== When Donor Adds Food ,Notify All Receivers===
        const receivers = await db.query("SELECT email FROM users WHERE role='receiver'");
        receivers.rows.forEach(r => {
            sendEmail(
                r.email,
                "New Food Donation Available!",
                `<p>New donation added: <b>${title}</b> at <b>${location}</b>. Log in to claim it!</p>`
            );
        });

        req.flash('success', 'Food item added and notified successfully!');
        res.redirect('/donor/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error adding food.');
        res.redirect('/donor/add');
    }
});

// ===== Edit Food =====
router.get('/edit/:id', async (req, res) => {
    try {
        const food = await db.query(
            'SELECT * FROM food_items WHERE id = $1 AND donor_id = $2',
            [req.params.id, req.session.user.id]
        );
        if (food.rows.length === 0) {
            req.flash('error', 'Food item not found.');
            return res.redirect('/donor/dashboard');
        }
        res.render('donor/edit_food', { item: food.rows[0] });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error loading edit page.');
        res.redirect('/donor/dashboard');
    }
});
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    const { title, description, quantity, location, expiry_time } = req.body;
    const newImage = req.file ? req.file.filename : null;

    try {
        if (newImage) {
            await db.query(
                'UPDATE food_items SET title=$1, description=$2, quantity=$3, location=$4, expiry_time=$5, image=$6 WHERE id=$7 AND donor_id=$8',
                [title, description, quantity, location, expiry_time, newImage, req.params.id, req.session.user.id]
            );
        } else {
            await db.query(
                'UPDATE food_items SET title=$1, description=$2, quantity=$3, location=$4, expiry_time=$5 WHERE id=$6 AND donor_id=$7',
                [title, description, quantity, location, expiry_time, req.params.id, req.session.user.id]
            );
        }

        req.flash('success', 'Food item updated.');
        res.redirect('/donor/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error updating food.');
        res.redirect('/donor/dashboard');
    }
});

// ===== Delete Food =====
router.post('/delete/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM food_items WHERE id=$1 AND donor_id=$2', [req.params.id, req.session.user.id]);
        req.flash('success', 'Food item deleted.');
        res.redirect('/donor/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error deleting food.');
        res.redirect('/donor/dashboard');
    }
});

// ===== View All Requests for Donor's Food =====
router.get('/requests', async (req, res) => {
    try {
        const requests = await db.query(
            `SELECT r.id, r.status, r.created_at,
                    u.username AS receiver_name, u.email AS receiver_email,
                    f.title AS food_title
             FROM requests r
             JOIN food_items f ON r.food_id = f.id
             JOIN users u ON r.receiver_id = u.id
             WHERE f.donor_id = $1
             ORDER BY r.created_at DESC`,
            [req.session.user.id]
        );
        res.render('donor/requests', { requests: requests.rows });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error loading requests.');
        res.redirect('/donor/dashboard');
    }
});

// ===== Approve / Deny Requests =====
router.post('/requests/approve/:id', async (req, res) => {
    await db.query('UPDATE requests SET status=$1 WHERE id=$2', ['approved', req.params.id]);
    
    
    // Fetch receiver email & food details
    const details = await db.query(`
        SELECT u.email, f.title FROM requests r
        JOIN users u ON r.receiver_id = u.id
        JOIN food_items f ON r.food_id = f.id
        WHERE r.id = $1
    `, [req.params.id]);

    if (details.rows.length) {
        const { email, title } = details.rows[0];
        sendEmail(email, "Your Food Request Approved!", `<p>Your request for <b>${title}</b> has been approved!</p>`);
    }
    
    req.flash('success', 'Request approved!');
    res.redirect('/donor/requests');
});
router.post('/requests/deny/:id', async (req, res) => {
    await db.query('UPDATE requests SET status=$1 WHERE id=$2', ['rejected', req.params.id]);
    
     // Fetch receiver email & food details
    const details = await db.query(`
        SELECT u.email, f.title FROM requests r
        JOIN users u ON r.receiver_id = u.id
        JOIN food_items f ON r.food_id = f.id
        WHERE r.id = $1
    `, [req.params.id]);

    if (details.rows.length) {
        const { email, title } = details.rows[0];
        sendEmail(email, "Your Food Request Was Rejected", `<p>Unfortunately, your request for <b>${title}</b> was rejected.</p>`);
    }

    req.flash('success', 'Request denied.');
    res.redirect('/donor/requests');
});

module.exports = router;
