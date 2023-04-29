const roles = require('express').Router();
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



module.exports = roles;
