const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Token'ı header'dan al (Genelde "Bearer <token>" formatında gelir)
  const tokenHeader = req.headers.authorization;

  if (!tokenHeader) {
    return res.status(401).json({ error: 'Erişim reddedildi. Token bulunamadı.' });
  }

  // "Bearer " kısmını atıp sadece kodu alıyoruz
  const token = tokenHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Geçersiz token formatı.' });
  }

  try {
    // Token'ı doğrula (Gizli anahtar authController ile AYNI olmalı)
    const decoded = jwt.verify(token, 'GIZLI_ANAHTAR');
    
    // Doğrulanan kullanıcıyı request'e ekle ki diğer fonksiyonlar kullansın
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token Hatası:", error.message);
    res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
};

module.exports = verifyToken;