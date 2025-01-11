import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '1611512',
  database: 'halisaha',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initializeDatabase = async () => {
  try {
    const tempPool = mysql.createPool({
      host: '127.0.0.1',
      user: 'root',
      password: '1611512',
      port: 3306
    });

    await tempPool.query('CREATE DATABASE IF NOT EXISTS halisaha');
    await tempPool.end();
    
    console.log('Veritabanı bağlantısı başarılı');
  } catch (error) {
    console.error('Veritabanı bağlantısı başlatılırken hata:', error);
    process.exit(1);
  }
};

initializeDatabase();

export default pool; 
