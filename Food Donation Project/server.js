const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 9000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Tamil@007',
    database: 'community_fridge'
});

// Endpoint to handle food load (POST)
app.post('/load-food', (req, res) => {
    const { foodName, cookedTiming, expiryTiming } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection: ', err);
            res.status(500).send('Error getting MySQL connection');
            return;
        }

        const query = 'INSERT INTO foods (food_name, cooked_timing, expiry_timing) VALUES (?, ?, ?)';
        connection.query(query, [foodName, cookedTiming, expiryTiming], (err, result) => {
            connection.release();

            if (err) {
                console.error('Error executing MySQL query: ', err);
                res.status(500).send('Error saving food data');
                return;
            }

            console.log('Food loaded successfully');
            res.send('Food loaded successfully');
        });
    });
});


app.get('/food-details/:food_id', (req, res) => {
    const foodId = req.params.food_id;
    const query = 'SELECT * FROM foods WHERE id = ?';

    pool.query(query, [foodId], (error, results) => {
        if (error) {
            console.error('Error retrieving food details:', error);
            res.status(500).send('Error retrieving food details');
            return;
        }

        if (results.length > 0) {
            res.json(results[0]); // Send JSON response with food details
        } else {
            res.status(404).json({ error: 'Food item not found' });
        }
    });
});
app.get('/', (req, res) => {
    res.render('fridge.hbs'); // Assuming you have an 'index.hbs' file in your 'views' directory
});
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
