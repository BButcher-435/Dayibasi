const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobscontroller'); // Controller'ı çağır
const verifyToken = require('../middleware/authMiddleware'); // Güvenlik kilidi

// --- 1. İLAN İŞLEMLERİ ---
// İlan oluştur (Sadece giriş yapmış işverenler)
router.post('/', verifyToken, jobsController.createJob);

// Tüm ilanları listele (Herkese açık)
router.get('/', jobsController.getAllJobs);

// Dashboard verilerini çek (ÖNEMLİ: /dashboard, /:id'den ÖNCE gelmeli yoksa dashboard'u id sanar!)
router.get('/dashboard', verifyToken, jobsController.getDashboardStats);

// Tek bir ilanın detayını getir (Herkese açık)
router.get('/:id', jobsController.getJob);


// --- 2. BAŞVURU İŞLEMLERİ ---
// İşe başvur (Sadece işçiler)
router.post('/:id/apply', verifyToken, jobsController.applyForJob);

// Başvuranları gör (Sadece işveren)
router.get('/:id/applicants', verifyToken, jobsController.getJobApplicants);

// Başvuru durumunu kontrol et (Daha önce başvurdum mu?)
router.get('/:id/check-status', verifyToken, jobsController.checkApplicationStatus);

// Başvuru durumunu güncelle (Kabul Et / Reddet)
// Frontend bu adrese istek atıyor: /jobs/:id/applicants/:userId
router.post('/:id/applicants/:userId', verifyToken, jobsController.updateApplicantStatus);


// --- 3. İŞ BİTİRME VE PUANLAMA ---
// İşi tamamla (Parayı aktar)
router.post('/:id/complete', verifyToken, jobsController.completeJob);

// Puan ver
router.post('/:id/rate', verifyToken, jobsController.rateUser);

// Kullanıcı yorumlarını getir
router.get('/reviews/:id', jobsController.getUserReviews);

module.exports = router;