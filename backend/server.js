const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/songs', express.static('/84SpotifyClone/songs'));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mayank1', // Replace with your MySQL password
    database: 'spotify_clone' // Database name
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database.');
    }
});

// Routes

// Signup
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    // Check if username exists
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length > 0) return res.status(400).json({ message: 'Username already exists' });

        // Hash the password and save to database
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) return res.status(500).json({ message: 'Error saving user' });
            res.json({ message: 'Signup successful' });
        });
    });
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        res.json({ message: 'Login successful' });
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});


// U-mayank01,P-Mayank01

