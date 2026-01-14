const { db } = require('../config/firebase');

// Dosya yüklendiğinde bu logu görmeliyiz
console.log("✅ jobsController.js dosyası yüklendi ve hazır!");

exports.createJob = async (req, res) => {
  console.log("--> jobsController.createJob FONKSİYONU BAŞLADI <--");

  try {
    // 1. Kullanıcı verisini kontrol et
    if (!req.user) {
        console.log("❌ HATA: req.user tanımlı değil! Middleware veriyi taşıyamamış.");
        return res.status(500).json({ error: "Sunucu hatası: Kullanıcı bilgisi eksik." });
    }
    const { uid } = req.user;
    console.log("1. Kullanıcı UID:", uid);

    // 2. Body verisini kontrol et
    console.log("2. Gelen Body Verisi:", req.body);
    const { title, description, price, location, category, deadline } = req.body;

    if (!title || !description || !price) {
      console.log("❌ HATA: Eksik veri.");
      return res.status(400).json({ error: 'Başlık, açıklama ve ücret zorunludur.' });
    }

    // 3. Veritabanı bağlantısını kontrol et
    console.log("3. Firestore'a bağlanılıyor (users)...");
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
        console.log("❌ HATA: Kullanıcı veritabanında yok!");
        return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    console.log("✅ Kullanıcı verisi çekildi:", userDoc.data().role);

    // 4. Rol Kontrolü
    const userData = userDoc.data();
    if (userData.role !== 'employer') {
      console.log("⛔ YETKİSİZ: Kullanıcı işveren değil.");
      return res.status(403).json({ error: 'Yetkisiz işlem! Sadece işverenler ilan açabilir.' });
    }

    // 5. Kayıt İşlemi
    console.log("4. İlan hazırlanıyor...");
    const newJob = {
      employerId: uid,
      employerName: `${userData.firstName} ${userData.lastName}`,
      title,
      description,
      price: parseFloat(price),
      location: location || 'Uzaktan',
      category: category || 'general',
      deadline: deadline || null,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    console.log("5. Firestore'a yazılıyor (jobs)...");
    const jobRef = await db.collection('jobs').add(newJob);
    console.log("✅ İlan başarıyla kaydedildi! ID:", jobRef.id);

    // 6. Yanıt Gönder
    return res.status(201).json({ 
      message: 'İlan başarıyla oluşturuldu.', 
      jobId: jobRef.id,
      job: newJob
    });

  } catch (error) {
    console.error("🔥 CONTROLLER İÇİNDE KRİTİK HATA:", error);
    return res.status(500).json({ error: 'İlan oluşturulurken bir hata oluştu: ' + error.message });
  }
};

// Diğer fonksiyonlar (şimdilik boş da olsa tanımlı kalsın ki import hatası almayalım)
exports.getAllJobs = async (req, res) => {
    // Listeleme kodları...
    res.json([]); 
};

exports.applyJob = async (req, res) => {
    // Başvuru kodları...
};
// ... (createJob, getAllJobs ve applyJob fonksiyonlarının altına ekle) ...

// --- TEK BİR İLANI DETAYLI GETİR ---
// ... (createJob, getAllJobs ve applyJob fonksiyonlarının altına ekle) ...

// --- TEK BİR İLANI DETAYLI GETİR ---
exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('jobs').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }

    let jobData = { id: doc.id, ...doc.data() };

    // EKSTRA: Bu ilana kaç kişi başvurmuş? Sayısını bulalım.
    const appsSnapshot = await db.collection('applications').where('jobId', '==', id).get();
    jobData.applicantCount = appsSnapshot.size; // Frontend'de kullanacağız

    res.status(200).json(jobData);
  } catch (error) {
    console.error("Detay hatası:", error);
    res.status(500).json({ error: 'İlan detayı alınamadı' });
  }
};

// --- BAŞVURANLARI LİSTELE (Sadece İlan Sahibi Görebilir) ---
exports.getJobApplicants = async (req, res) => {
  try {
    const { id } = req.params; // Job ID
    const { uid } = req.user;  // İstek yapan kullanıcının ID'si

    // 1. İlanı bul ve sahibi kim kontrol et
    const jobDoc = await db.collection('jobs').doc(id).get();
    if (!jobDoc.exists) return res.status(404).json({ error: 'İlan bulunamadı' });

    if (jobDoc.data().employerId !== uid) {
      return res.status(403).json({ error: 'Bu ilanın başvurularını görüntüleme yetkiniz yok.' });
    }

    // 2. Başvuruları çek
    const appsSnapshot = await db.collection('applications').where('jobId', '==', id).get();
    
    const applicants = [];
    appsSnapshot.forEach(doc => {
      applicants.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(applicants);

  } catch (error) {
    console.error("Başvuranları çekme hatası:", error);
    res.status(500).json({ error: 'Başvuranlar alınamadı' });
  }
};