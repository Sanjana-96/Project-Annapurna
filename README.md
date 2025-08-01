Project Annapurna
A leftover food-sharing platform connecting donors with those in need.


📌 Overview
Project Annapurna is a web-based platform designed to reduce food wastage by connecting donors (restaurants, individuals, events) with receivers (NGOs, needy individuals).
It simplifies the process of sharing surplus food safely and efficiently.


🚀 Features
User Authentication – Separate dashboards for donors & receivers.

Donor Dashboard – Add details of leftover food, quantity, and availability.

Receiver Module – Browse available food and request it easily.

Database Integration – PostgreSQL for reliable data storage.

Responsive UI – Optimized for mobile and desktop use.

Secure Data Handling – Environment variables for sensitive configs.


🛠 Tech Stack
Frontend: HTML, CSS, JavaScript, EJS

Backend: Node.js, Express.js

Database: PostgreSQL

Authentication: Bcrypt (for password hashing)

Other Tools: Git, GitHub


📂 Project Structure

Project-Annapurna/
│
├── models/           # Database models
├── routes/           # Routes for auth, donors, receivers
├── uploads/          # Food image uploads
├── views/            # EJS templates (auth, donor, receiver, partials)
├── public/           # CSS, JS, assets
├── .env.example      # Example environment variables
├── .gitignore        # Ignored files (node_modules, .env, etc.)
└── app.js            # Entry point


⚙️ Setup & Installation

Clone the repository
git clone https://github.com/your-username/Project-Annapurna.git
cd Project-Annapurna

Install dependencies
npm install


