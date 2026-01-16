# Dayıbaşı (İşBul) V4 - Full Stack İş Platformu

Dayıbaşı, işverenler ile günlük/saha işçilerini buluşturan, güvenli ödeme (simüle), iş takibi ve puanlama sistemine sahip kapsamlı bir Full Stack mobil uyumlu web uygulamasıdır.



## Öne Çıkan Özellikler

* **Çift Rol Sistemi:** Kullanıcılar kayıt aşamasında `İşçi` veya `İşveren` rolünü seçer.
* **İlan Yönetimi:** İşverenler ilan açabilir, başvuruları görüntüleyebilir ve uygun adayı "İşe Al" butonuyla seçebilir.
* **İş Akışı Döngüsü:** Başvuru -> İşe Alım -> İşi Tamamlama -> Karşılıklı Puanlama.
* **Cüzdan Sistemi:** Kullanıcılar bakiye yükleyebilir ve işlem geçmişlerini görüntüleyebilir.
* **Güvenlik:** Firebase Admin SDK ile JWT tabanlı kimlik doğrulama ve Middleware koruması.
* **Mükerrer Başvuru Engeli:** Hem frontend hem backend tarafında çift başvuruyu engelleyen kontrol mekanizması.

---

## Teknik Yığın (Tech Stack)

**Frontend:**
* React.js (Context API ile State Yönetimi)
* React Router DOM (Navigasyon)
* Axios (API İstekleri)
* Modern CSS (Responsive Tasarım)

**Backend:**
* Node.js & Express.js
* Firebase Admin SDK (Veritabanı ve Kimlik Doğrulama)
* Nodemailer (E-posta bildirimleri için altyapı)
* Dotenv (Çevresel değişken yönetimi)

---

## Proje Yapısı ve Diyagramı
(mermaid)
graph TD
    subgraph "Frontend (React)"
        A[App.jsx] --> B[AuthContext.jsx]
        B --> C{Sayfalar}
        C --> D[JobsList]
        C --> E[JobDetail]
        C --> F[Dashboard]
        C --> G[Billing/Cüzdan]
    end

    subgraph "Backend (Express)"
        H[index.js] --> I[Routes]
        I --> J[authRoutes]
        I --> K[JobsRoutes]
        J --> L[authController]
        K --> M[jobsController]
        L & M --> N[authMiddleware - Güvenlik]
    end

    subgraph "Veritabanı (Firebase)"
        L --> O[(Firestore DB)]
        M --> O
        P[Firebase Auth] --> L
    end



⚙️ Kurulum ve Çalıştırma
1. Depoyu Klonlayın
Bash

git clone [https://github.com/BButcher-435/Dayibasi.git](https://github.com/BButcher-435/Dayibasi.git)
cd Dayibasi
2. Backend Kurulumu
Bash

cd server
npm install
# .env dosyasını oluşturun ve Firebase keylerinizi ekleyin
npm run dev
3. Frontend Kurulumu
Bash

cd client
npm install
npm run dev
📝 Gelecek Planları (Roadmap)
[ ] Canlı Sohbet (Real-time Chat) sistemi.

[ ] Harita entegrasyonu (İşleri konuma göre görme).

[ ] Gerçek ödeme kanalı entegrasyonu (Iyzico/Stripe).

[ ] Push bildirimleri.

Geliştirici: BButcher-435 ,  boratasi , furkanozatlar , yeahcel

Durum: V4 MVP Tamamlandı ✅
