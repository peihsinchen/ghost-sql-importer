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
  res.send(\`<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Ghost SQL 匯入工具</title><style>body{font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Arial,sans-serif;max-width:800px;margin:50px auto;padding:20px;background:#f5f5f5}.container{background:white;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}h1{color:#333}.upload-area{border:2px dashed #ddd;padding:30px;text-align:center;border-radius:8px;margin:20px 0}button{background:#0066cc;color:white;border:none;padding:12px 24px;border-radius:6px;cursor:pointer;font-size:16px}button:hover{background:#0052a3}button:disabled{background:#ccc;cursor:not-allowed}#progress{margin:20px 0;display:none}.progress-bar{width:100%;height:30px;background:#f0f0f0;border-radius:15px;overflow:hidden}.progress-fill{height:100%;background:#0066cc;transition:width 0.3s;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold}#log{background:#1e1e1e;color:#d4d4d4;padding:15px;border-radius:6px;font-family:'Courier New',monospace;font-size:13px;max-height:400px;overflow-y:auto;margin-top:20px;display:none}.log-line{margin:5px 0}.log-success{color:#4ec9b0}.log-error{color:#f48771}.log-info{color:#9cdcfe}.warning{background:#fff3cd;border:1px solid #ffc107;padding:15px;border-radius:6px;margin:20px 0}</style></head><body><div class=\"container\"><h1>🗄️ Ghost SQL 匯入工具</h1><div class=\"warning\"><strong>⚠️ 警告：</strong>這將會刪除現有資料表並匯入新資料！請確保已備份。</div><div class=\"upload-area\"><h3>上傳 SQL 檔案</h3><input type=\"file\" id=\"fileInput\" accept=\".sql\" multiple style=\"margin:10px 0\"><p style=\"color:#666;font-size:14px\">支援單一大檔案或多個小檔案（會按照檔名順序匯入）</p></div><button id=\"importBtn\" onclick=\"startImport()\">開始匯入</button><div id=\"progress\"><div class=\"progress-bar\"><div class=\"progress-fill\" id=\"progressFill\">0%</div></div></div><div id=\"log\"></div></div><script>let files=[];document.getElementById('fileInput').addEventListener('change',(e)=>{files=Array.from(e.target.files).sort((a,b)=>a.name.localeCompare(b.name));log('已選擇 '+files.length+' 個檔案','info')});async function startImport(){if(files.length===0){alert('請先選擇檔案！');return}const btn=document.getElementById('importBtn');const progress=document.getElementById('progress');const logDiv=document.getElementById('log');btn.disabled=true;progress.style.display='block';logDiv.style.display='block';logDiv.innerHTML='';log('開始匯入 '+files.length+' 個檔案...','info');for(let i=0;i<files.length;i++){const file=files[i];const percent=Math.round(((i+1)/files.length)*100);updateProgress(percent);log('匯入 ['+(i+1)+'/'+files.length+'] '+file.name+'...','info');try{const formData=new FormData();formData.append('sqlFile',file);const response=await fetch('/import',{method:'POST',body:formData});const result=await response.json();if(result.success){log('✅ '+file.name+' 匯入成功','success')}else{log('❌ '+file.name+' 失敗：'+result.error,'error')}}catch(error){log('❌ '+file.name+' 錯誤：'+error.message,'error')}}log('\\n🎉 全部完成！','success');btn.disabled=false}function updateProgress(percent){const fill=document.getElementById('progressFill');fill.style.width=percent+'%';fill.textContent=percent+'%'}function log(message,type='info'){const logDiv=document.getElementById('log');const line=document.createElement('div');line.className='log-line log-'+type;line.textContent='['+new Date().toLocaleTimeString()+'] '+message;logDiv.appendChild(line);logDiv.scrollTop=logDiv.scrollHeight}</script></body></html>\`);
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
