const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const db = new sqlite3.Database('./db/users.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
});

app.use(express.static('public'));
app.use(bodyParser.json());

// 에셋 목록 API
app.get('/api/products', (req, res) => {
  const data = fs.readFileSync(path.join(__dirname, 'data', 'products.json'));
  res.json(JSON.parse(data));   
});

// 개별 에셋 API
app.get('/api/products/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'products.json')));
  const product = data.find(p => p.id == req.params.id);
  product ? res.json(product) : res.status(404).json({ error: '에셋을 찾을 수 없습니다.' });
});

// 회원가입 API
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`,
    [username, password],
    function (err) {
      if (err) return res.status(400).json({ success: false, message: '이미 존재하는 사용자입니다.' });
      res.json({ success: true });
    });
});

// 로그인 API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => {
      if (row) res.json({ success: true, username: row.username });
      else res.status(401).json({ success: false, message: '로그인 실패' });
    });
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});