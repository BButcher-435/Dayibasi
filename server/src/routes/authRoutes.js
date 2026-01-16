const express = require("express");
const router = express.Router();

// 1. Controller fonksiyonlarını içe aktar (getUserProfile'ı listeye ekledim)
const { 
  register, 
  login, 
  updateProfile, 
  deposit, 
  getUserProfile 
} = require("../controllers/authController");

const verifyToken = require("../middleware/authMiddleware");

// --- ROTALAR ---

// Kayıt ve Giriş
router.post("/register", register);
router.post("/login", login);

// Profil İşlemleri
router.put("/update-profile", verifyToken, updateProfile);

// 🔥 DÜZELTME BURADA: Artık 'authController.getUserProfile' değil, direkt 'getUserProfile'
router.get('/user/:id', getUserProfile);

// Para Yükle
router.post("/deposit", verifyToken, deposit);

module.exports = router;