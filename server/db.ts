import sql from 'mssql';

const dbConfig: sql.config = {
  server: process.env.DB_SERVER || 'DESKTOP-20A1N2N',
  database: process.env.DB_DATABASE || 'NARA',
  requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '0'),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    ...(process.env.DB_INSTANCE && { instanceName: process.env.DB_INSTANCE }),
  },
  // For Windows Authentication (Trusted Connection)
  authentication: {
    type: 'ntlm',
    options: {
      domain: process.env.DB_DOMAIN || '',
      userName: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || '',
    }
  },
  // Uncomment for SQL Server Authentication:
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) return pool;

  // If pool exists but is not connected, close it safely
  if (pool) {
    try {
      await pool.close();
    } catch (e) {
      console.warn('Error closing stale pool:', e);
    }
    pool = null;
  }

  try {
    pool = await sql.connect(dbConfig);
    console.log('✅ Connected to MSSQL database:', dbConfig.database);
    return pool;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw err;
  }
}

export { sql };