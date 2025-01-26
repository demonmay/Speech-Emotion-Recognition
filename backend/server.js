const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();



// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


// Absolute paths for static files
const songsPath = path.join(__dirname, '../songs');
app.use('/songs', express.static(songsPath));
const recordingsPath = path.join(__dirname, '../recordings');
app.use('/recordings', express.static(recordingsPath));


// Configure multer to save to the recordings folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const recordingsFolder = path.join(__dirname, '../recordings');
        
        // Ensure the recordings folder exists
        if (!fs.existsSync(recordingsFolder)) {
            fs.mkdirSync(recordingsFolder, { recursive: true });
        }
        cb(null, recordingsFolder);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}.wav`); // Save file as timestamp.wav
    }
});


// Serve static files for recordings
// if (fs.existsSync(recordingsPath)) {
//     app.use('/recordings', express.static(recordingsPath));
//     console.log(`Serving recordings from: ${recordingsPath}`);
// } else {
//     console.error(`Recordings folder not found at: ${recordingsPath}`);
// }


// Configure multer for file upload
const upload = multer({ storage });


// MySQL Connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mayank1', // Replace with your MySQL password
    database: 'spotify_clone' // Database name
});

module.exports=db;

// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err);
        
//     } else {
//         console.log('Connected to MySQL database.');
//     }
// });


// Example API route to check database connection
app.get('/', (req, res) => {
    res.send('Server is running!');
});


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

// API endpoint to save audio
app.post('/save-audio', upload.single('audio'), (req, res) => {
    console.log('File uploaded:', req.file); // Log file details
    if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ message: 'No audio file uploaded' });
    }

    console.log('Audio saved at:', req.file.path);
    res.status(200).json({ message: 'Audio saved successfully', filePath: req.file.path });
});


// Example API route to save a playlist
app.post('/api/playlists', (req, res) => {
    const { username, name, songs } = req.body;

    console.log('Incoming request to save playlist:', { username, name, songs });

    if (!username || !name || !songs) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    const sql = `
        INSERT INTO playlists (name, user, songs)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE songs = ?
    `;

    db.query(
        sql,
        [name, username, JSON.stringify(songs), JSON.stringify(songs)],
        (err, result) => {
            if (err) {
                console.error('Error saving playlist:', err);
                return res.status(500).json({ message: 'Failed to save playlist.' });
            }

            console.log('Playlist saved successfully:', result);
            res.status(200).json({ message: 'Playlist saved successfully.' });
        }
    );
});


// Example API route to fetch playlists
app.get('/api/playlists/:username', (req, res) => {
    const { username } = req.params;
    const sql = `SELECT * FROM playlists WHERE user = ?`;

    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error fetching playlists:', err);
            return res.status(500).json({ message: 'Failed to fetch playlists.' });
        }
        res.status(200).json({ playlists: results });
    });
});




// Serve static files (for testing)
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});


// U-mayank01,P-Mayank01
