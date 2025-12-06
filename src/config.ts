import dotenv from 'dotenv';

export const databaseHost = process.env.DB_HOST || 'localhost';
export const databaseUser = process.env.DB_USER || 'root';
export const databasePort = parseInt(process.env.DB_PORT || '3306');
export const databaseName = process.env.DB_NAME || 'arte';
export const databasePassWord = process.env.DB_PASSWORD || '';

export const sKey = process.env.JWT_SECRET || 'Ooops';

export const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
