const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

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
  maxAllowedPacket: 1073741824
};

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/test', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('SELECT 1');
    await connection.end();
    res.json({ success: true, message: 'Database connected!' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/import', upload.single('sqlFile'), async (req, res) => {
  let connection;
  
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    console.log('Processing: ' + req.file.originalname);
    
    const sqlContent = await fs.readFile(req.file.path, 'utf-8');
    connection = await mysql.createConnection(dbConfig);
    
    await connection.query(sqlContent);
    await fs.unlink(req.file.path);
    
    console.log('Success: ' + req.file.originalname);
    
    res.json({ 
      success: true, 
      message: 'Import successful',
      filename: req.file.originalname 
    });

  } catch (error) {
    console.error('Error:', error.message);
    
    if (req.file) {
      try { await fs.unlink(req.file.path); } catch (e) {}
    }
    
    res.json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    if (connection) await connection.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('SQL Import Service running on port ' + PORT);
  console.log('Database host: ' + dbConfig.host);
});
