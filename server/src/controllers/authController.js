const { db } = require('../config/firebase');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- 1. KAYIT OL (REGISTER) ---
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, bio } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre zorunludur.' });
    }

    const userCheck = await db.collection('users').where('email', '==', email).get();
    if (!userCheck.empty) {
      return res.status(400).json({ error: 'Bu email zaten kullanımda.' });
    }

    const newUserRef = db.collection('users').doc();
    const newUser = {
      firstName: firstName || 'İsimsiz',
      lastName: lastName || 'Kullanıcı',
      email,
      password, // Gerçek projede hashlenmeli
      role: role || 'worker',
      phone: phone || '',
      bio: bio || '',
      balance: 0,
      createdAt: new Date().toISOString()
    };

    await newUserRef.set(newUser);
    res.status(201).json({ message: 'Kayıt başarılı! Giriş yapabilirsiniz.' });

  } catch (error) {
    console.error("Kayıt hatası:", error);
    res.status(500).json({ error: 'Kayıt işlemi başarısız.' });
  }
};

// --- 2. GİRİŞ YAP (LOGIN - JWT) ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(400).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;

    if (userData.password !== password) {
      return res.status(400).json({ error: 'Hatalı şifre!' });
    }

    // Token Oluştur
    const token = jwt.sign(
      { uid: uid, email: userData.email, role: userData.role }, 
      'GIZLI_ANAHTAR', 
      { expiresIn: '24h' }
    );

    // Frontend için temiz veri
    const safeUser = {
      uid: uid,
      firstName: userData.firstName || 'Misafir',
      lastName: userData.lastName || '',
      email: userData.email,
      role: userData.role || 'worker',
      balance: userData.balance || 0,
      bio: userData.bio || '',
      phone: userData.phone || ''
    };

    console.log("✅ GİRİŞ YAPILDI: ", safeUser.firstName);

    res.status(200).json({
      message: 'Giriş başarılı',
      token,
      user: safeUser
    });

  } catch (error) {
    console.error("Login hatası:", error);
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};

// --- 3. PROFİL GÜNCELLE (UPDATE PROFILE) --- 
// ✅ AuthRoutes için eklendi
exports.updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { firstName, lastName, phone, bio } = req.body;

    const userRef = db.collection('users').doc(uid);
    await userRef.update({
      firstName,
      lastName,
      phone,
      bio
    });

    // Güncel veriyi geri döndür ki frontend yenilesin
    const updatedDoc = await userRef.get();
    res.status(200).json({ message: 'Profil güncellendi.', user: { uid, ...updatedDoc.data() } });

  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    res.status(500).json({ error: 'Güncelleme başarısız.' });
  }
};

// --- 4. PARA YÜKLE (DEPOSIT) ---
// ✅ AuthRoutes için eklendi
exports.deposit = async (req, res) => {
  try {
    const { uid } = req.user;
    const { amount } = req.body;
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ error: 'Geçerli bir miktar girin.' });
    }

    const userRef = db.collection('users').doc(uid);

    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      if (!doc.exists) throw new Error("Kullanıcı bulunamadı.");
      
      const currentBalance = doc.data().balance || 0;
      const newBalance = currentBalance + depositAmount;

      t.update(userRef, { balance: newBalance });
    });

    res.status(200).json({ message: 'Para başarıyla yüklendi.' });

  } catch (error) {
    console.error("Para yükleme hatası:", error);
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
};

// --- 🔥 LOGLU VERSİYON: KULLANICI PROFİLİNİ GETİR ---
exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params; // URL'den gelen ID
    
    // CASUS 1: Konsola gelen ID'yi yazdır
    console.log(`📢 Profil İsteği Geldi! Aranan ID: "${id}"`);

    if (!id || id === 'undefined' || id === 'null') {
        console.log("❌ HATA: Geçersiz ID gönderildi.");
        return res.status(400).json({ error: 'Geçersiz Kullanıcı ID.' });
    }
    
    // Veritabanından kullanıcıyı bul
    const userDoc = await db.collection('users').doc(id).get();

    if (!userDoc.exists) {
      console.log("❌ HATA: Veritabanında bu ID ile kayıt yok.");
      return res.status(404).json({ error: 'Kullanıcı veritabanında bulunamadı.' });
    }

    const userData = userDoc.data();
    console.log("✅ BAŞARILI: Kullanıcı bulundu:", userData.firstName);

    // Güvenli veriyi hazırla
    const safeData = {
      uid: userDoc.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email, 
      role: userData.role,
      balance: userData.balance, 
      createdAt: userData.createdAt,
      bio: userData.bio || '',
      phone: userData.phone || ''
    };

    res.status(200).json(safeData);
  } catch (error) {
    console.error("🔥 SUNUCU HATASI (Profil Çekme):", error);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};