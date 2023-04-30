const departments = require('express').Router();
const mysql = require('mysql2');
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.MySQL_password,
        database: 'corporation_db'
    },
    console.log('Connected to the corporation_db database.')
);


/*
// Read list of all reviews and associated movie name using LEFT JOIN
departments.get('/', (req, res) => {
    const sql = `SELECT movies.movie_name AS movie, reviews.review FROM reviews LEFT JOIN movies ON reviews.movie_id = movies.id ORDER BY movies.movie_name;`;
    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// Update review name
// PUT 
// http://localhost:3001/api/review/1
// {
// "movie": "Lion King",
// "review": "Amazing!!!!"
// }

departments.put('/:id', (req, res) => {
    const sql = `UPDATE reviews SET review = ? WHERE id = ?`;
    const params = [req.body.review, req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
        } else if (!result.affectedRows) {
            res.json({
                message: 'Movie not found'
            });
        } else {
            res.json({
                message: 'success',
                data: req.body,
                changes: result.affectedRows
            });
        }
    });
});
*/
module.exports = departments;
