const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

// Controller Fonksiyonlarını Import Et
const { 
  createJob, 
  getAllJobs, 
  applyJob, 
  getJob, 
  getJobApplicants,
  checkApplicationStatus,
  getDashboardStats,
  acceptApplication, // Yeni: İşe alım
  completeJob,       // Yeni: İş tamamlama
  rateUser           // Yeni: Puanlama
} = require('../controllers/jobscontroller');

// --- ÖZEL ROTALAR (Statik yollar en üste!) ---

// 1. Dashboard Verileri
router.get('/dashboard', verifyToken, getDashboardStats);

// 2. Tüm İlanları Listele
router.get('/', getAllJobs);


// --- ID GEREKTİREN ROTALAR ---

// 3. Başvuru Durumu Kontrolü
router.get('/:id/check', verifyToken, checkApplicationStatus);

// 4. Başvuranları Gör (İşveren için)
router.get('/:id/applicants', verifyToken, getJobApplicants);

// 5. İşe Alım İşlemi (Belirli bir başvuruyu kabul et)
router.post('/:id/accept/:appId', verifyToken, acceptApplication);

// 6. İşi Tamamla
router.post('/:id/complete', verifyToken, completeJob);

// 7. İşe Başvur
router.post('/:id/apply', verifyToken, applyJob);

// 8. Puan Ver (İş bittikten sonra)
router.post('/:id/rate', verifyToken, rateUser);

// 9. Tek İlan Detayı (Parametreli genel yol olduğu için sonda)
router.get('/:id', getJob);


// --- OLUŞTURMA ---

// 10. İlan Oluştur
router.post('/', verifyToken, createJob);

module.exports = router;