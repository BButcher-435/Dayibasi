const express = require("express");
const router = express.Router();

// Controller'dan fonksiyonları alıyoruz
const { register, login, updateProfile } = require("../controllers/authController");

// Güvenlik için middleware'i alıyoruz
const verifyToken = require("../middleware/authMiddleware");

// --- ROTALAR ---

// Kayıt Ol (Herkese Açık)
router.post("/register", register);

// Giriş Yap (Herkese Açık)
router.post("/login", login);

// Profil Güncelle (Korumalı - Sadece giriş yapmış kullanıcılar)
router.put("/update-profile", verifyToken, updateProfile);

module.exports = router;