const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  // Header'dan token'ı al: "Bearer eyJhbGciOi..."
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Yetkisiz erişim! Token bulunamadı.' });
  }

  try {
    // Firebase'e sor: "Bu token geçerli mi?"
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Geçerliyse, kullanıcının bilgilerini isteğe (req) ekle
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token doğrulama hatası:", error);
    return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş Token' });
  }
};

module.exports = verifyToken;