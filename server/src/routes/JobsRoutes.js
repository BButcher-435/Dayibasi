const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { 
  createJob, 
  getAllJobs, 
  applyJob, 
  getJob, 
  getJobApplicants 
} = require('../controllers/jobscontroller');

// DİKKAT: index.js'de bu dosyayı '/jobs' ön ekiyle çağıracağız.
// O yüzden buradaki yollar sadece '/' veya '/:id' olacak.

// Herkese Açık Rotalar
router.get('/', getAllJobs);                // GET /jobs
router.get('/:id', getJob);                 // GET /jobs/:id

// Korumalı Rotalar (Giriş Şart)
router.post('/', verifyToken, createJob);           // POST /jobs
router.post('/:id/apply', verifyToken, applyJob);   // POST /jobs/:id/apply
router.get('/:id/check', verifyToken, require('../controllers/jobscontroller').checkApplicationStatus);
router.get('/:id/applicants', verifyToken, getJobApplicants); // GET /jobs/:id/applicants
router.get('/dashboard', verifyToken, require('../controllers/jobscontroller').getDashboardStats); // Tek satırda import edip bağladık

module.exports = router;