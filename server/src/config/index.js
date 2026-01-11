const express = require('express');
const cors = require('cors');
require('dotenv').config(); // .env kullanırsak diye hazır olsun

// Firebase bağlantısını çağır
const { db } = require('./config/firebase');

const app = express();

// Middleware (İstekleri okuyabilmek için)
app.use(cors());
app.use(express.json());

// Test Rotası (Server çalışıyor mu?)
app.get('/', (req, res) => {
  res.send('Server isbul02 Çalışıyor! 🚀');
});

// Port Ayarı
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda dinleniyor...`);
});