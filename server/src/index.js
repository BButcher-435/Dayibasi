require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Route Dosyalarını Çağır
const authRoutes = require('./routes/authRoutes');
const jobsRoutes = require('./routes/JobsRoutes');

const app = express();

// CORS Ayarı (Frontend 5173'ten geliyorsa izin ver)
app.use(cors());
app.use(express.json());

// Log Middleware (Gelen istekleri terminalde görmek için)
app.use((req, res, next) => {
  console.log(`📡 İSTEK GELDİ: ${req.method} ${req.url}`);
  next();
});

// --- ROTALAR ---
app.get('/', (req, res) => {
  res.send('Server (isbul v4) Hazır! 🚀');
});

// 🔥 DÜZELTME BURADA YAPILDI 🔥
// Frontend '/auth/login' adresine istek atıyor.
// O yüzden burası '/' değil, '/auth' OLMALI.
app.use('/auth', authRoutes); 

// Job rotalarını '/jobs' altına topluyoruz
app.use('/jobs', jobsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
  console.log(`👉 Giriş Adresi: http://localhost:${PORT}/auth/login`);
});