export const databaseHost = 'mysql.railway.internal';
export const databaseUser = process.env.MYSQLUSER || 'root';
export const databasePort = parseInt(process.env.MYSQLPORT || '3306');
export const databaseName = process.env.MYSQLDATABASE || 'arte';
export const databasePassWord = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || ''

export const sKey = process.env.JWT_SECRET || 'Ooops';

export const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
