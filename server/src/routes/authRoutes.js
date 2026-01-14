const express = require("express");
const router = express.Router();

// Şimdilik controller'dan SADECE register'ı alıyoruz.
// completeProfile ve login henüz yazılmadığı için sildik.
const { register } = require("../controllers/authController");

// Middleware dosyanın var olup olmadığından emin değilim.
// Hata riskini sıfıra indirmek için şimdilik bunu da kapattım.
// const verifyToken = require("../middleware/authMiddleware");

// --- AKTİF ROTALAR ---
router.post("/register", register);
// İş (Job) Rotaları
app.post('/jobs', verifyToken, createJob); // İlan oluşturma (Korumalı)
app.get('/jobs', getAllJobs);              // İlanları listeleme (Herkese açık)

// --- HENÜZ HAZIR OLMAYAN ROTALAR (İleride açacağız) ---

// router.post("/complete-profile", verifyToken, completeProfile);

// Login işlemi genellikle POST olur (şifre gönderildiği için).
// Veri çekmek için genellikle '/me' veya '/profile' kullanılır.
// router.post("/login", login); 

module.exports = router;