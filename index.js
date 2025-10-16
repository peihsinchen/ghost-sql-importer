const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const fs = require('fs').promises;

const app = express();
const upload = multer({ dest: 'uploads/' });

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

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});async function startImport(){if(files.length===0){alert('請先選擇檔案！');return}const btn=document.getElementById('importBtn');const progress=document.getElementById('progress');const logDiv=document.getElementById('log');btn.disabled=true;progress.style.display='block';logDiv.style.display='block';logDiv.innerHTML='';log('開始匯入 '+files.length+' 個檔案...','info');for(let i=0;i<files.length;i++){const file=files[i];const percent=Math.round(((i+1)/files.length)*100);updateProgress(percent);log('匯入 ['+(i+1)+'/'+files.length+'] '+file.name+'...','info');try{const formData=new FormData();formData.append('sqlFile',file);const response=await fetch('/import',{method:'POST',body:formData});const result=await response.json();if(result.success){log('✅ '+file.name+' 匯入成功','success')}else{log('❌ '+file.name+' 失敗：'+result.error,'error')}}catch(error){log('❌ '+file.name+' 錯誤：'+error.message,'error')}}log('\\n🎉 全部完成！','success');btn.disabled=false}function updateProgress(percent){const fill=document.getElementById('progressFill');fill.style.width=percent+'%';fill.textContent=percent+'%'}function log(message,type='info'){const logDiv=document.getElementById('log');const line=document.createElement('div');line.className='log-line log-'+type;line.textContent='['+new Date().toLocaleTimeString()+'] '+message;logDiv.appendChild(line);logDiv.scrollTop=logDiv.scrollHeight}</script></body></html>\`);
});

app.get('/test', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('SELECT 1');
    await connection.end();
    res.json({ success: true, message: '資料庫連線成功！' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/import', upload.single('sqlFile'), async (req, res) => {
  let connection;
  try {
    if (!req.file) throw new Error('沒有上傳檔案');
    const sqlContent = await fs.readFile(req.file.path, 'utf-8');
    connection = await mysql.createConnection(dbConfig);
    await connection.query(sqlContent);
    await fs.unlink(req.file.path);
    res.json({ success: true, message: '匯入成功', filename: req.file.originalname });
  } catch (error) {
    console.error('匯入錯誤：', error);
    if (req.file) {
      try { await fs.unlink(req.file.path); } catch (e) {}
    }
    res.json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`SQL 匯入服務運行在 port \${PORT}\`);
  console.log(\`資料庫主機：\${dbConfig.host}\`);
});
