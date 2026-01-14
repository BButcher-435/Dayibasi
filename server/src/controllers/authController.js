const { auth, db } = require('../config/firebase'); // Config klasöründen çektik
const axios = require('axios');

// --- REGISTER (KAYIT) ---
exports.register = async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  // Basit validasyon
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "E-posta veya şifre geçersiz (min 6 karakter)." });
  }

  try {
    // 1. Auth Kullanıcısı Oluştur
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`
    });

    // 2. Detayları Firestore'a Kaydet
    // 'users' koleksiyonuna UID ile döküman açıyoruz
    await db.collection('users').doc(userRecord.uid).set({
      firstName,
      lastName,
      email,
      phone,
      role: role || 'worker', // Seçilmezse varsayılan 'worker'
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
  
  // BURAYA KENDİ WEB API KEY'İNİ YAPIŞTIRMAYI UNUTMA
  const FIREBASE_API_KEY = "BURAYA_FIREBASE_WEB_API_KEY_GELECEK"; 

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

  try {
    // Firebase REST API ile giriş yap
    const response = await axios.post(url, {
      email,
      password,
      returnSecureToken: true
    });

    const { idToken, localId } = response.data;
    
    // Kullanıcının rolünü öğrenmek için veritabanına sor
    const userDoc = await db.collection('users').doc(localId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    res.status(200).json({ 
      message: "Giriş Başarılı", 
      token: idToken, 
      uid: localId,
      role: userData.role || 'worker', // Frontend'e rolü gönderiyoruz
      name: userData.firstName || ''
    });

  } catch (error) {
    console.error("Login Hatası:", error.response?.data?.error?.message || error.message);
    res.status(401).json({ error: "E-posta veya şifre hatalı!" });
  }
};