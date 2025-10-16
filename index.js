const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const fs = require('fs').promises;

const app = express();
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 500 * 1024 * 1024 }
});

const dbConfig = {
  host: process.env.DB_HOST || 'service-68ef5d18a21c4059789a0215',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'k2N6I38Zpgd0H4rTofnmePavKw971Jb5',
  database: process.env.DB_NAME || 'zeabur',
  multipleStatements: true,
  connectTimeout: 60000,
  connectionLimit: 5,
  waitForConnections: true,
  queueLimit: 0
};

// 使用連線池而不是每次建立新連線
const pool = mysql.createPool(dbConfig);

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/test', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.execute('SELECT 1');
    res.json({ success: true, message: '資料庫連線成功！' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/import', upload.single('sqlFile'), async (req, res) => {
  let connection;
  
  try {
    if (!req.file) {
      throw new Error('沒有上傳檔案');
    }

    console.log('處理: ' + req.file.originalname);
    
    const sqlContent = await fs.readFile(req.file.path, 'utf-8');
    
    // 從連線池取得連線
    connection = await pool.getConnection();
    
    await connection.query(sqlContent);
    await fs.unlink(req.file.path);
    
    console.log('✅ ' + req.file.originalname);
    
    res.json({ 
      success: true, 
      message: '匯入成功',
      filename: req.file.originalname 
    });

  } catch (error) {
    console.error('錯誤: ' + error.message);
    
    if (req.file) {
      try { await fs.unlink(req.file.path); } catch (e) {}
    }
    
    res.json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    // 重要：釋放連線回連線池
    if (connection) connection.release();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('✅ 服務運行在 port ' + PORT);
  console.log('📊 資料庫: ' + dbConfig.host);
});
