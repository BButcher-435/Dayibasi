// server/src/controllers/authController.js
require('dotenv').config();
const { auth, db } = require('../config/firebase'); 
const axios = require('axios');

// --- REGISTER (KAYIT) ---
exports.register = async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "E-posta veya şifre geçersiz (min 6 karakter)." });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`
    });

    await db.collection('users').doc(userRecord.uid).set({
      firstName,
      lastName,
      email,
      phone,
      role: role || 'worker',
      createdAt: new Date().toISOString(),
      uid: userRecord.uid
    });

    res.status(201).json({ message: "Kayıt Başarılı", uid: userRecord.uid });

  } catch (error) {
    console.error("Register Hatası:", error);
    if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({ error: "Bu e-posta zaten kullanımda." });
    }
    res.status(400).json({ error: "Kayıt işlemi başarısız." });
  }
};

// --- LOGIN (GİRİŞ) ---
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY; 

  if (!FIREBASE_API_KEY) {
    console.error("HATA: .env dosyasında FIREBASE_API_KEY bulunamadı!");
    return res.status(500).json({ error: "Sunucu yapılandırma hatası." });
  }

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

  try {
    const response = await axios.post(url, {
      email,
      password,
      returnSecureToken: true
    });

    const { idToken, localId } = response.data;
    const userDoc = await db.collection('users').doc(localId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    res.status(200).json({ 
      message: "Giriş Başarılı", 
      token: idToken, 
      uid: localId,
      role: userData.role || 'worker',
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email
    });

  } catch (error) {
    console.error("Login Hatası:", error.message);
    res.status(401).json({ error: "E-posta veya şifre hatalı!" });
  }
};

// --- PROFİL GÜNCELLEME ---
exports.updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { firstName, lastName, phone, bio } = req.body;

    await db.collection('users').doc(uid).update({
      firstName,
      lastName,
      phone,
      bio,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'Profil başarıyla güncellendi.' });
  } catch (error) {
    console.error("Profil güncellenemedi:", error);
    res.status(500).json({ error: 'Profil güncellenemedi.' });
  }
};