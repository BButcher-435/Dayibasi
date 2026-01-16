const { db } = require('../config/firebase'); // Veya '../utils/firebase' dosya yolun neyse o kalmalı

console.log("✅ jobsController.js dosyası yüklendi ve hazır!");

// --- 1. İLAN OLUŞTURMA (BAKİYELİ SİSTEM) ---
exports.createJob = async (req, res) => {
  try {
    if (!req.user) return res.status(500).json({ error: "Kullanıcı bilgisi eksik." });
    const { uid } = req.user;
    const { title, description, price, location, category, deadline } = req.body;
    
    const jobPrice = parseFloat(price); // Sayıya çevir

    await db.runTransaction(async (t) => {
      // 1. Kullanıcı verisini çek (Transaction içinde)
      const userRef = db.collection('users').doc(uid);
      const userDoc = await t.get(userRef);

      if (!userDoc.exists) throw new Error("Kullanıcı bulunamadı.");
      const userData = userDoc.data();

      if (userData.role !== 'employer') {
        throw new Error("Sadece işverenler ilan açabilir.");
      }

      // 2. Bakiye Kontrolü
      if (userData.balance < jobPrice) {
        throw new Error(`Yetersiz Bakiye! Mevcut bakiyeniz: ${userData.balance} TL`);
      }

      // 3. İlan Objesi Hazırla
      const newJobRef = db.collection('jobs').doc(); // ID'yi önceden al
      const newJob = {
        employerId: uid,
        employerName: `${userData.firstName} ${userData.lastName}`,
        title,
        description,
        price: jobPrice,
        location: location || 'Uzaktan',
        category: category || 'general',
        deadline: deadline || null,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // 4. İşlemleri Yap (Parayı düş, ilanı ekle)
      const newBalance = userData.balance - jobPrice;
      t.update(userRef, { balance: newBalance }); // Parayı düş
      t.set(newJobRef, newJob); // İlanı kaydet
    });

    res.status(201).json({ message: 'İlan oluşturuldu ve ücret bakiyeden düşüldü.' });

  } catch (error) {
    console.error("İlan oluşturma hatası:", error);
    res.status(400).json({ error: error.message || 'İşlem başarısız.' });
  }
};

// --- 2. TÜM İLANLARI LİSTELE ---
exports.getAllJobs = async (req, res) => {
  try {
    const jobsSnapshot = await db.collection('jobs').orderBy('createdAt', 'desc').get();
    const jobs = [];
    jobsSnapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }));
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Listeleme hatası:", error);
    res.status(500).json({ error: 'İlanlar alınamadı.' });
  }
};

// --- 3. TEK İLAN DETAYI ---
exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('jobs').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'İlan bulunamadı' });

    let jobData = { id: doc.id, ...doc.data() };
    const appsSnapshot = await db.collection('applications').where('jobId', '==', id).get();
    jobData.applicantCount = appsSnapshot.size;

    res.status(200).json(jobData);
  } catch (error) {
    res.status(500).json({ error: 'İlan detayı alınamadı' });
  }
};

// --- 4. İŞE BAŞVURMA (GÜVENLİ VERSİYON) ---
exports.applyForJob = async (req, res) => {
  try {
    const { id } = req.params; // Job ID
    const { uid } = req.user;  // Worker ID

    const jobRef = db.collection('jobs').doc(id);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'İş ilanı bulunamadı.' });
    }

    const jobData = jobDoc.data();

    // 🛑 KONTROL 1: İlan aktif mi?
    if (jobData.status !== 'active') {
      return res.status(400).json({ error: 'Bu ilan artık başvurulara kapalıdır.' });
    }

    // 🛑 KONTROL 2: Kendi ilanına başvuramaz
    if (jobData.employerId === uid) {
      return res.status(400).json({ error: 'Kendi ilanınıza başvuramazsınız.' });
    }

    // 🛑 KONTROL 3: Zaten başvurmuş mu?
    const existingApp = await db.collection('applications')
      .where('jobId', '==', id)
      .where('workerId', '==', uid)
      .get();

    if (!existingApp.empty) {
      return res.status(400).json({ error: 'Bu ilana zaten başvurdunuz!' });
    }

    // Her şey temizse başvuruyu kaydet
    const workerDoc = await db.collection('users').doc(uid).get();
    const workerName = `${workerDoc.data().firstName} ${workerDoc.data().lastName}`;

    const application = {
      jobId: id,
      workerId: uid,
      workerName,
      userEmail: workerDoc.data().email, // Email bilgisini de ekleyelim
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    await db.collection('applications').add(application);
    
    res.status(200).json({ message: 'Başvuru başarıyla alındı.' });

  } catch (error) {
    console.error("Başvuru hatası:", error);
    res.status(500).json({ error: 'Başvuru yapılamadı.' });
  }
};

// --- 5. BAŞVURULARI GÖR (İŞVEREN) - [DÜZELTİLEN KISIM] ---
exports.getJobApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    
    // Önce ilanın sahibi olup olmadığını kontrol et
    const jobDoc = await db.collection('jobs').doc(id).get();
    if (!jobDoc.exists || jobDoc.data().employerId !== uid) {
      return res.status(403).json({ error: 'Yetkisiz erişim.' });
    }

    // Başvuruları çek
    const snapshot = await db.collection('applications').where('jobId', '==', id).get();
    
    const applicants = [];

    // 🔥 DÜZELTME: Her başvuru için kullanıcı detaylarını da alalım
    for (const doc of snapshot.docs) {
      const appData = doc.data();
      let userData = {};

      // Eğer workerId varsa git users tablosundan adını soyadını bul
      if (appData.workerId) {
        try {
          const userDoc = await db.collection('users').doc(appData.workerId).get();
          if (userDoc.exists) {
            userData = userDoc.data();
          }
        } catch (e) {
          console.log("Kullanıcı detayı çekilemedi:", appData.workerId);
        }
      }

      applicants.push({
        id: doc.id,
        ...appData,
        // Frontend'in beklediği isim formatlarını garanti edelim
        userFirstName: userData.firstName || appData.workerName?.split(' ')[0] || 'İsimsiz',
        userLastName: userData.lastName || '',
        userEmail: userData.email || appData.userEmail || 'Email Yok',
        userId: appData.workerId
      });
    }

    res.status(200).json(applicants);

  } catch (error) {
    console.error("Başvuru listeleme hatası:", error);
    res.status(500).json({ error: 'Veri alınamadı.' });
  }
};

// --- 6. BAŞVURU DURUMU KONTROLÜ ---
exports.checkApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const snapshot = await db.collection('applications').where('jobId', '==', id).get();
    
    let hasApplied = false;
    snapshot.forEach(doc => { if (doc.data().workerId === uid) hasApplied = true; });
    
    res.status(200).json({ hasApplied });
  } catch (error) {
    res.status(500).json({ error: 'Hata.' });
  }
};

// --- 7. DASHBOARD VERİLERİ (DÜZELTİLMİŞ HALİ) ---
exports.getDashboardStats = async (req, res) => {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();
    const role = userDoc.data().role;
    let items = [];

    if (role === 'employer') {
      // İŞVEREN KISMI 
      const snapshot = await db.collection('jobs').where('employerId', '==', uid).get();
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    } else {
      // İŞÇİ KISMI
      const snapshot = await db.collection('applications').where('workerId', '==', uid).get();
      
      for (const doc of snapshot.docs) {
        const appData = doc.data();
        const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
        // İş verisi varsa al, yoksa (silinmişse) varsayılan değer ata
        const jobData = jobDoc.exists ? jobDoc.data() : { title: 'Silinmiş İş', price: 0, status: 'deleted' };

        // Dashboard güncellemesi: İş tamamlandıysa, başvuruyu da tamamlanmış göster
        let displayStatus = appData.status;
        if (appData.status === 'accepted' && jobData.status === 'completed') {
           displayStatus = 'completed';
        }

        items.push({ 
           id: doc.id, 
           ...appData,     
           title: jobData.title, 
           price: jobData.price,
           status: displayStatus 
        });
      }
    }
    
    res.status(200).json({ role, balance: userDoc.data().balance || 0, items });
  } catch (error) {
    console.error("Dashboard hatası:", error);
    res.status(500).json({ error: 'Veri alınamadı.' });
  }
};

// --- 8. BAŞVURU DURUMU GÜNCELLE (Kabul/Red) ---
// [EKSİK PARÇA: Senin 'acceptApplication' kodun sadece kabul ediyordu,
// Reddetmeyi de desteklemesi için bu şekilde güncelledim]
exports.updateApplicantStatus = async (req, res) => {
    try {
      const { id, userId } = req.params; // id: jobId, userId: workerId (Dikkat: AppID değil WorkerID geliyordu frontendden)
      // VEYA Frontend Applicant ID gönderiyorsa ona göre revize etmeliyiz.
      // Senin Applicant.jsx: handleStatusChange(app.userId, 'accepted') gönderiyor.
      // Yani parametredeki userId aslında Worker'ın ID'si.
  
      const { status } = req.body; // accepted / rejected
      const { uid } = req.user;
  
      const jobRef = db.collection('jobs').doc(id);
      const jobDoc = await jobRef.get();
  
      if (!jobDoc.exists || jobDoc.data().employerId !== uid) {
        return res.status(403).json({ error: 'Yetkisiz işlem.' });
      }
  
      // WorkerID'ye göre Application dökümanını bulmamız lazım
      const appSnapshot = await db.collection('applications')
        .where('jobId', '==', id)
        .where('workerId', '==', userId)
        .get();
  
      if (appSnapshot.empty) {
          return res.status(404).json({ error: 'Başvuru bulunamadı.' });
      }
  
      const appRef = appSnapshot.docs[0].ref;
  
      await db.runTransaction(async (t) => {
        t.update(appRef, { status });
        
        // Sadece kabul edildiyse işi 'in_progress' yap ve işçiyi ata
        if (status === 'accepted') {
          t.update(jobRef, { 
            status: 'in_progress',
            assignedWorkerId: userId 
          });
        }
      });
  
      res.status(200).json({ message: `Durum güncellendi: ${status}` });
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
      res.status(500).json({ error: 'İşlem başarısız.' });
    }
};

// --- 9. İŞİ TAMAMLA VE PARAYI TRANSFER ET ---
exports.completeJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    await db.runTransaction(async (t) => {
      // 1. İlan verisini çek
      const jobRef = db.collection('jobs').doc(id);
      const jobDoc = await t.get(jobRef);

      if (!jobDoc.exists) throw new Error("İlan bulunamadı.");
      const jobData = jobDoc.data();

      // Yetki Kontrolü
      if (jobData.employerId !== uid) throw new Error("Bu işlemi yapmaya yetkiniz yok.");
      if (jobData.status !== 'in_progress') throw new Error("Bu iş şu an tamamlanmaya uygun değil.");
      if (!jobData.assignedWorkerId) throw new Error("Bu işe atanmış bir işçi yok.");

      // 2. İşçiyi bul
      const workerRef = db.collection('users').doc(jobData.assignedWorkerId);
      const workerDoc = await t.get(workerRef);
      
      if (!workerDoc.exists) throw new Error("İşçi hesabı bulunamadı.");

      // 3. İşçinin bakiyesini güncelle
      const currentBalance = workerDoc.data().balance || 0;
      const newBalance = currentBalance + jobData.price;

      t.update(workerRef, { balance: newBalance });

      // 4. İşi tamamlandı olarak işaretle
      t.update(jobRef, { status: 'completed' });
    });

    res.status(200).json({ message: 'İş tamamlandı ve ücret işçiye aktarıldı!' });

  } catch (error) {
    console.error("Tamamlama hatası:", error);
    res.status(400).json({ error: error.message || 'Hata oluştu.' });
  }
};

// --- 10. PUAN VER (RATE) ---
exports.rateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const { score, comment } = req.body;

    const jobDoc = await db.collection('jobs').doc(id).get();
    if (!jobDoc.exists) return res.status(404).json({ error: 'İş bulunamadı.' });
    
    const jobData = jobDoc.data();

    if (jobData.status !== 'completed') {
      return res.status(400).json({ error: 'İş henüz tamamlanmamış.' });
    }

    let targetUserId;
    if (uid === jobData.employerId) {
      targetUserId = jobData.assignedWorkerId;
    } else if (uid === jobData.assignedWorkerId) {
      targetUserId = jobData.employerId;
    } else {
      return res.status(403).json({ error: 'Bu işlemle alakanız yok.' });
    }

    await db.collection('ratings').add({
      jobId: id,
      fromUserId: uid,
      toUserId: targetUserId,
      score: parseInt(score),
      comment,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: 'Puanınız kaydedildi.' });
  } catch (error) {
    console.error("Puanlama hatası:", error);
    res.status(500).json({ error: 'Puan verilemedi.' });
  }
};

// --- 11. KULLANICI YORUMLARINI GETİR ---
exports.getUserReviews = async (req, res) => {
  try {
    const { id } = req.params; // Hedef kullanıcının ID'si

    const reviewsSnapshot = await db.collection('ratings').where('toUserId', '==', id).get();
    
    let reviews = [];
    let totalScore = 0;

    for (const doc of reviewsSnapshot.docs) {
      const data = doc.data();
      
      const reviewerDoc = await db.collection('users').doc(data.fromUserId).get();
      const reviewerName = reviewerDoc.exists 
        ? `${reviewerDoc.data().firstName} ${reviewerDoc.data().lastName}` 
        : 'Anonim Kullanıcı';

      reviews.push({
        id: doc.id,
        ...data,
        reviewerName
      });
      
      totalScore += data.score;
    }

    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const average = reviews.length > 0 ? (totalScore / reviews.length).toFixed(1) : 0;

    res.status(200).json({ reviews, average, total: reviews.length });

  } catch (error) {
    console.error("Yorumları çekme hatası:", error);
    res.status(500).json({ error: 'Yorumlar alınamadı.' });
  }
};