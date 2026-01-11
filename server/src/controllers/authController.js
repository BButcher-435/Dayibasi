const admin = require('../config/firebase');

exports.register = async (req, res) => {
  console.log(">>> 1. Register Fonksiyonu Başladı");
  
  // Gelen veriyi görelim (Şifreyi güvenlik için maskelemiyorum şu an, testteyiz)
  console.log(">>> Gelen Veri (Body):", req.body);

  const { email, password, displayName } = req.body;

  if (!email || !password || password.length < 6) {
    console.log(">>> HATA: Validasyon başarısız.");
    return res.status(400).json({ 
      error: "Geçersiz veri. Şifre en az 6 karakter olmalı." 
    });
  }

  try {
    console.log(">>> 2. Firebase'e istek gönderiliyor...");
    
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    console.log(">>> 3. Firebase Kaydı Başarılı! ID:", userRecord.uid);

    return res.status(201).json({ 
      message: "Kayıt başarılı", 
      user: userRecord 
    });

  } catch (error) {
    console.log(">>> 4. HATA YAKALANDI!");
    // Hatanın tamamını yazdıralım ki ne olduğunu görelim
    console.log("DETAYLI HATA:", error); 
    console.log("Hata Kodu:", error.code);

    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: "Bu e-posta adresi zaten kullanımda." });
    }
    
    if (error.code === 'auth/invalid-password') {
      return res.status(400).json({ error: "Şifre çok zayıf veya geçersiz." });
    }

    return res.status(500).json({ error: "Sunucu hatası: Kayıt yapılamadı." });
  }
};