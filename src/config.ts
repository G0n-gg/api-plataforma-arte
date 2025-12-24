export const databaseHost = process.env.MYSQLHOST || 'shinkansen.proxy.rlwy.net'
export const databaseUser = process.env.MYSQLUSER || 'root';
export const databasePort = parseInt(process.env.MYSQLPORT || '46114');
export const databaseName = process.env.MYSQLDATABASE || 'arte';
export const databasePassWord = process.env.MYSQL_ROOT_PASSWORD || ''

export const sKey = process.env.JWT_SECRET;

export const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
