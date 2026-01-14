const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

// Kayıt ve Giriş Rotaları
router.post("/register", register);
router.post("/login", login);

module.exports = router;