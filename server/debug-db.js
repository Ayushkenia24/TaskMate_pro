const mysql = require('mysql2');
require('dotenv').config();

console.log('--- DEBUGGING CONNECTION VARIABLES ---');
console.log('DB_HOST:', `"${process.env.DB_HOST}"`); // Quotes help see spaces
console.log('DB_PORT:', `"${process.env.DB_PORT}"`);
console.log('DB_USER:', `"${process.env.DB_USER}"`);
console.log('DB_NAME:', `"${process.env.DB_NAME}"`);
console.log('--------------------------------------');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

console.log('Attempting to connect...');
connection.connect((err) => {
    if (err) {
        console.error('❌ CONNECTION FAILED:', err.code);
        console.error('Error Details:', err.message);
    } else {
        console.log('✅ CONNECTED SUCCESSFULLY!');
        connection.end();
    }
});
