const { auth } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  console.log("-> Middleware Başladı: verifyToken");

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("-> HATA: Header eksik veya yanlış format.");
      return res.status(401).json({ error: 'Token bulunamadı.' });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log("-> Token Ayrıştırıldı (İlk 10 karakter):", token.substring(0, 10) + "...");

    console.log("-> Firebase'e soruluyor: verifyIdToken...");
    // BURASI KRİTİK: Eğer burada takılıyorsa Firebase bağlantısında sorun vardır
    const decodedToken = await auth.verifyIdToken(token);
    console.log("-> Firebase Yanıt Verdi! UID:", decodedToken.uid);
    
    req.user = decodedToken;
    
    console.log("-> Controller'a geçiliyor (next)...");
    next();

  } catch (error) {
    console.error("-> MİDDLEWARE HATASI (Catch Bloğu):", error);
    res.status(403).json({ error: 'Yetkilendirme hatası.' });
  }
};

module.exports = verifyToken;