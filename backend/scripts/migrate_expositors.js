const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'expoferiascr'
    });

    try {
        console.log('Adding column tiene_expositores...');
        await connection.query('ALTER TABLE eventos ADD COLUMN tiene_expositores TINYINT(1) DEFAULT 1;');
        console.log('Success!');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists, skipping.');
        } else {
            console.error('Error:', err);
        }
    } finally {
        await connection.end();
    }
}

migrate();
