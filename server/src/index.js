const express = require('express');
// ... diğer importların (cors, dotenv vs.) burada kalsın

// YENİ EKLEMEN GEREKEN TEK SATIR BU:
const { auth } = require('./firebase'); 

const app = express();
app.use(express.json()); // JSON verisi alıyorsan bu gereklidir

// Örnek: Token Kontrolü Yapan Endpoint
app.post('/api/verify-token', async (req, res) => {
    try {
        const { token } = req.body; // Frontend'den gelen token
        
        // ESKİDEN: admin.auth().verifyIdToken(...)
        // ŞİMDİ SADECE:
        const decodedToken = await auth.verifyIdToken(token);
        
        res.json({ uid: decodedToken.uid, email: decodedToken.email });
    } catch (error) {
        console.error("Token hatası:", error);
        res.status(401).send("Yetkisiz giriş");
    }
});

app.listen(3000, () => {
    console.log('Server 3000 portunda çalışıyor');
});