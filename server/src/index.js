const express = require('express');
const cors = require('cors');

// --- CONTROLLER IMPORTLARI ---
const { register, login } = require('./controllers/authController');

// DİKKAT: Dosya ismin 'jobscontroller.js' olduğu için küçük harfle çağırıyoruz
const { 
  createJob, 
  getAllJobs, 
  applyJob, 
  getJob, 
  getJobApplicants 
} = require('./controllers/jobscontroller');

// --- MIDDLEWARE IMPORTLARI ---
const verifyToken = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// --- LOG MIDDLEWARE ---
app.use((req, res, next) => {
  console.log(`📡 İSTEK GELDİ: ${req.method} ${req.url}`);
  next();
});

// --- ROTALAR ---
app.get('/', (req, res) => {
  res.send('Server (isbul v4) Hazır! 🚀');
});

// 1. Auth Rotaları
app.post('/register', register);
app.post('/login', login);

// 2. İş (Job) Rotaları
// İlan Oluşturma (Sadece İşveren)
app.post('/jobs', verifyToken, createJob);

// Tüm İlanları Listeleme (Herkese Açık)
app.get('/jobs', getAllJobs);

// Tek İlan Detayı (Herkese Açık)
app.get('/jobs/:id', getJob);

// İşe Başvuru (Sadece İşçi)
app.post('/jobs/:id/apply', verifyToken, applyJob);

// Başvuranları Listeleme (Sadece İlan Sahibi)
app.get('/jobs/:id/applicants', verifyToken, getJobApplicants);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});