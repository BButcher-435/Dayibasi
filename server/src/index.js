require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Route Dosyalarını Çağır
const authRoutes = require('./routes/authRoutes');
const jobsRoutes = require('./routes/JobsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Log Middleware (İstekleri görmek için)
app.use((req, res, next) => {
  console.log(`📡 İSTEK GELDİ: ${req.method} ${req.url}`);
  next();
});

// --- ROTALAR ---
app.get('/', (req, res) => {
  res.send('Server (isbul v4) Hazır! 🚀');
});

// Auth rotalarını ana dizine bağlıyoruz (/register, /login çalışmaya devam etsin diye)
app.use('/', authRoutes);

// Job rotalarını '/jobs' altına topluyoruz
// Örn: jobsRoutes içindeki '/' artık '/jobs' oldu.
app.use('/jobs', jobsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});