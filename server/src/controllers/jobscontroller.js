const { db } = require('../config/firebase');

console.log("✅ jobsController.js dosyası yüklendi ve hazır!");

// --- İLAN OLUŞTURMA (MEVCUT) ---
exports.createJob = async (req, res) => {
  console.log("--> createJob BAŞLADI");
  try {
    if (!req.user) return res.status(500).json({ error: "Kullanıcı bilgisi eksik." });
    const { uid } = req.user;
    const { title, description, price, location, category, deadline } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Eksik veri.' });
    }

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    
    const userData = userDoc.data();
    if (userData.role !== 'employer') {
      return res.status(403).json({ error: 'Sadece işverenler ilan açabilir.' });
    }

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

    const jobRef = await db.collection('jobs').add(newJob);
    
    return res.status(201).json({ 
      message: 'İlan oluşturuldu.', 
      jobId: jobRef.id,
      job: newJob
    });

  } catch (error) {
    console.error("HATA:", error);
    return res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
  }
};

// --- TÜM İLANLARI LİSTELE (YENİ - SARI BÖLGE 1) ---
exports.getAllJobs = async (req, res) => {
  try {
    // Sadece 'active' durumdaki ilanları çekelim
    // Eğer tümünü çekmek istersen .where kısmını silebilirsin
    const jobsSnapshot = await db.collection('jobs')
        //.where('status', '==', 'active') // İsteğe bağlı filtre
        .orderBy('createdAt', 'desc') // En yeniler üstte
        .get();

    const jobs = [];
    jobsSnapshot.forEach(doc => {
      jobs.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error("İlanları çekme hatası:", error);
    res.status(500).json({ error: 'İlanlar alınamadı.' });
  }
};

// --- İŞE BAŞVURU YAP (YENİ - SARI BÖLGE 2) ---
exports.applyJob = async (req, res) => {
  try {
    const { id } = req.params; // Job ID
    const { uid } = req.user;  // Başvuran İşçinin ID'si (Token'dan gelir)

    // 1. İlan var mı?
    const jobDoc = await db.collection('jobs').doc(id).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'İlan bulunamadı.' });
    }

    // 2. İşveren kendi ilanına başvuramasın
    if (jobDoc.data().employerId === uid) {
      return res.status(400).json({ error: 'Kendi ilanınıza başvuramazsınız.' });
    }

    // 3. Mükerrer başvuru kontrolü (Daha önce başvurmuş mu?)
    const existingApp = await db.collection('applications')
      .where('jobId', '==', id)
      .where('workerId', '==', uid)
      .get();

    if (!existingApp.empty) {
      return res.status(400).json({ error: 'Bu ilana zaten başvurdunuz.' });
    }

    // 4. Başvuranın ismini al (Listelemede kolaylık olsun diye kaydediyoruz)
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    // 5. Başvuruyu Kaydet
    const newApplication = {
      jobId: id,
      workerId: uid,
      workerName: `${userData.firstName} ${userData.lastName}`,
      employerId: jobDoc.data().employerId, // İlan sahibini de ekleyelim, sorgularken lazım olur
      status: 'pending', // pending, accepted, rejected
      appliedAt: new Date().toISOString()
    };

    await db.collection('applications').add(newApplication);

    res.status(201).json({ message: 'Başvurunuz başarıyla alındı.' });

  } catch (error) {
    console.error("Başvuru hatası:", error);
    res.status(500).json({ error: 'Başvuru sırasında hata oluştu.' });
  }
};

// --- TEK İLAN DETAYI (MEVCUT) ---
exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('jobs').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }

    let jobData = { id: doc.id, ...doc.data() };

    // Başvuru sayısını ekle
    const appsSnapshot = await db.collection('applications').where('jobId', '==', id).get();
    jobData.applicantCount = appsSnapshot.size;

    res.status(200).json(jobData);
  } catch (error) {
    console.error("Detay hatası:", error);
    res.status(500).json({ error: 'İlan detayı alınamadı' });
  }
};

// --- BAŞVURANLARI LİSTELE (MEVCUT) ---
exports.getJobApplicants = async (req, res) => {
  try {
    const { id } = req.params; 
    const { uid } = req.user; 

    const jobDoc = await db.collection('jobs').doc(id).get();
    if (!jobDoc.exists) return res.status(404).json({ error: 'İlan bulunamadı' });

    if (jobDoc.data().employerId !== uid) {
      return res.status(403).json({ error: 'Yetkisiz erişim.' });
    }

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
// ... (Diğer fonksiyonların altına ekle)

// --- DASHBOARD VERİLERİ (YENİ - KIRMIZI BÖLGE) ---
exports.getDashboardStats = async (req, res) => {
  try {
    const { uid } = req.user;
    
    // 1. Kullanıcı Rolünü Bul
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    const role = userDoc.data().role;

    let items = [];

    if (role === 'employer') {
      // İŞVEREN İSE: Kendi açtığı ilanları getir
      const snapshot = await db.collection('jobs')
        .where('employerId', '==', uid)
        .orderBy('createdAt', 'desc')
        .get();
      
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));

    } else {
      // İŞÇİ İSE: Başvurduğu işleri getir
      const appsSnapshot = await db.collection('applications')
        .where('workerId', '==', uid)
        .orderBy('appliedAt', 'desc')
        .get();
      
      // Başvuruların iş detaylarını (Başlık, Fiyat) da çekmemiz lazım
      const promises = appsSnapshot.docs.map(async (doc) => {
        const appData = doc.data();
        // İlgili iş detayını jobID ile çek
        const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
        const jobData = jobDoc.exists ? jobDoc.data() : { title: 'Silinmiş İlan', price: 0 };
        
        return {
          id: doc.id,
          ...appData,
          title: jobData.title, // İlan başlığı
          price: jobData.price,
          status: appData.status // Başvuru durumu (pending, accepted vs.)
        };
      });

      items = await Promise.all(promises);
    }

    res.status(200).json({ role, items });

  } catch (error) {
    console.error("Dashboard veri hatası:", error);
    res.status(500).json({ error: 'Veriler alınamadı.' });
  }
  // ... (Diğer fonksiyonların altına)

// --- BAŞVURU KONTROLÜ (YENİ) ---
exports.checkApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params; // Job ID
    const { uid } = req.user;  // User ID

    const snapshot = await db.collection('applications')
      .where('jobId', '==', id)
      .where('workerId', '==', uid)
      .get();

    // Eğer doküman varsa başvuru yapılmış demektir
    const hasApplied = !snapshot.empty;
    
    res.status(200).json({ hasApplied });

  } catch (error) {
    console.error("Başvuru kontrol hatası:", error);
    res.status(500).json({ error: 'Kontrol yapılamadı' });
  }
};
};