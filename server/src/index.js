const express = require('express');
const cors = require('cors');
// Controller'ı doğru klasörden çağırıyoruz
const { register, login } = require('./controllers/authController');

const app = express();

app.use(cors());
app.use(express.json());

// --- ROTALAR ---
app.get('/', (req, res) => {
  res.send('Server (isbul v4) Hazır! 🚀');
});

// Kayıt ve Giriş rotalarını direkt buraya bağlıyoruz
app.post('/register', register);
app.post('/login', login);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});