# Ghost SQL 匯入服務

這是一個部署到 Zeabur 的 SQL 匯入服務，用於匯入大型 Ghost 資料庫。

## 快速部署

### 方法 1：使用 GitHub

1. 建立 Git repository：
   \`\`\`bash
   git init
   git add .
   git commit -m "初始提交"
   \`\`\`

2. 推送到 GitHub（需要先在 GitHub 建立 repository）：
   \`\`\`bash
   git remote add origin https://github.com/你的用戶名/ghost-sql-importer.git
   git push -u origin main
   \`\`\`

3. 在 Zeabur 控制台：
   - 點擊 Add Service
   - 選擇 Git
   - 選擇你的 repository
   - 等待自動部署

### 方法 2：使用 Zeabur CLI

\`\`\`bash
npm install -g @zeabur/cli
zeabur login
zeabur deploy
\`\`\`

## 使用說明

1. 部署完成後，開啟 Zeabur 提供的 URL
2. 選擇要匯入的 SQL 檔案
3. 點擊「開始匯入」
4. 等待匯入完成

## 支援的檔案

- 單一大檔案（432MB）
- 多個小檔案（會按照檔名順序自動匯入）

## 環境變數（選用）

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASS
- DB_NAME

不設定的話會使用程式碼中的預設值。
