// Eski require('firebase-admin') yöntemini kullanmıyoruz.
// Yeni versiyon (v13+) için doğrusu bu:

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

// Anahtar dosyan bir üst klasörde olduğu için '../' kullanıyoruz
const serviceAccount = require("../serviceAccountKey.json");

const app = initializeApp({
  credential: cert(serviceAccount)
});

// Auth yetkisini alıyoruz
const auth = getAuth(app);

// Sadece auth'u dışarı açıyoruz, böylece "admin.auth" demene gerek kalmayacak
module.exports = { auth };