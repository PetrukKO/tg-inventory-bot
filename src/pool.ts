import { Pool } from 'pg';
import 'dotenv/config';

export const pool = new Pool({
    connectionString: process.env.DB_URL,
});

pool.connect()
    .then(() => console.log('подключено к бд'))
    .catch(err => console.error('ошибка: ', err.stack));