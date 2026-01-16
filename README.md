Dayıbaşı (İşBul) V4 - Full Stack Job Platform
Dayıbaşı is a comprehensive, mobile-compatible full-stack web application that connects employers with daily/field workers, featuring a (simulated) secure payment system, job tracking, and a rating system.

Key Features
Dual Role System: Users select either Worker or Employer roles during registration.

Listing Management: Employers can post jobs, view applications, and select candidates using the "Hire" button.

Workflow Cycle: Application -> Hiring -> Job Completion -> Mutual Rating.

Wallet System: Users can top up their balance and view transaction history.

Security: JWT-based authentication and middleware protection via Firebase Admin SDK.

Duplicate Application Prevention: Control mechanisms on both frontend and backend to prevent multiple applications for the same job.

Tech Stack
Frontend:

React.js (State Management with Context API)

React Router DOM (Navigation)

Axios (API Requests)

Modern CSS (Responsive Design)

Backend:

Node.js & Express.js

Firebase Admin SDK (Database & Authentication)

Nodemailer (Infrastructure for email notifications)

Dotenv (Environment variable management)

Project Structure and Diagram 
graph TD
    subgraph "Frontend (React)"
        A[App.jsx] --> B[AuthContext.jsx]
        B --> C{Pages}
        C --> D[JobsList]
        C --> E[JobDetail]
        C --> F[Dashboard]
        C --> G[Billing/Wallet]
    end

    subgraph "Backend (Express)"
        H[index.js] --> I[Routes]
        I --> J[authRoutes]
        I --> K[JobsRoutes]
        J --> L[authController]
        K --> M[jobsController]
        L & M --> N[authMiddleware - Security]
    end

    subgraph "Database (Firebase)"
        L --> O[(Firestore DB)]
        M --> O
        P[Firebase Auth] --> L
    end
    Installation and Setup
1. Clone the Repository
Bash

git clone https://github.com/BButcher-435/Dayibasi.git
cd Dayibasi
2. Backend Setup
Bash

cd server
npm install
# Create a .env file and add your Firebase keys
npm run dev
3. Frontend Setup
Bash

cd client
npm install
npm run dev
📝 Roadmap
[ ] Real-time Chat system.

[ ] Map Integration (View jobs by location).

[ ] Real Payment Gateway integration (Iyzico/Stripe).
----------------------------------------------------------------------------------------------------------------


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

Durum: V6 MVP Tamamlandı 
