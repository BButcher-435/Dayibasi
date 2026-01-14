const { db } = require('../config/firebase');

console.log("✅ jobsController.js dosyası yüklendi ve hazır!");

// --- 1. İLAN OLUŞTURMA ---
exports.createJob = async (req, res) => {
  try {
    if (!req.user) return res.status(500).json({ error: "Kullanıcı bilgisi eksik." });
    const { uid } = req.user;
    const { title, description, price, location, category, deadline } = req.body;

    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists && userDoc.data().role !== 'employer') {
      return res.status(403).json({ error: 'Sadece işverenler ilan açabilir.' });
    }

    const newJob = {
      employerId: uid,
      employerName: `${userDoc.data().firstName} ${userDoc.data().lastName}`,
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
    res.status(201).json({ message: 'İlan oluşturuldu.', jobId: jobRef.id, job: newJob });

  } catch (error) {
    console.error("İlan oluşturma hatası:", error);
    res.status(500).json({ error: 'Sunucu hatası.' });
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

// --- 4. İŞE BAŞVURU YAP ---
exports.applyJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const jobDoc = await db.collection('jobs').doc(id).get();
    if (!jobDoc.exists) return res.status(404).json({ error: 'İlan bulunamadı.' });

    if (jobDoc.data().employerId === uid) {
      return res.status(400).json({ error: 'Kendi ilanınıza başvuramazsınız.' });
    }

    const existingApps = await db.collection('applications').where('jobId', '==', id).get();
    let alreadyApplied = false;
    existingApps.forEach(doc => { if (doc.data().workerId === uid) alreadyApplied = true; });

    if (alreadyApplied) return res.status(400).json({ error: 'Zaten başvurdunuz.' });

    const userDoc = await db.collection('users').doc(uid).get();
    await db.collection('applications').add({
      jobId: id,
      workerId: uid,
      workerName: `${userDoc.data().firstName} ${userDoc.data().lastName}`,
      employerId: jobDoc.data().employerId,
      status: 'pending',
      appliedAt: new Date().toISOString()
    });

    res.status(201).json({ message: 'Başvuru alındı.' });
  } catch (error) {
    console.error("Başvuru hatası:", error);
    res.status(500).json({ error: 'Başvuru hatası.' });
  }
};

// --- 5. BAŞVURULARI GÖR (İŞVEREN) ---
exports.getJobApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    
    const jobDoc = await db.collection('jobs').doc(id).get();
    if (!jobDoc.exists || jobDoc.data().employerId !== uid) {
      return res.status(403).json({ error: 'Yetkisiz erişim.' });
    }

    const snapshot = await db.collection('applications').where('jobId', '==', id).get();
    const applicants = [];
    snapshot.forEach(doc => applicants.push({ id: doc.id, ...doc.data() }));
    res.status(200).json(applicants);
  } catch (error) {
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

// --- 7. DASHBOARD VERİLERİ ---
exports.getDashboardStats = async (req, res) => {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();
    const role = userDoc.data().role;
    let items = [];

    if (role === 'employer') {
      const snapshot = await db.collection('jobs').where('employerId', '==', uid).orderBy('createdAt', 'desc').get();
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    } else {
      const snapshot = await db.collection('applications').where('workerId', '==', uid).orderBy('appliedAt', 'desc').get();
      for (const doc of snapshot.docs) {
        const appData = doc.data();
        const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
        const jobData = jobDoc.exists ? jobDoc.data() : { title: 'Silinmiş', price: 0 };
        items.push({ id: doc.id, ...appData, title: jobData.title, price: jobData.price });
      }
    }
    res.status(200).json({ role, items });
  } catch (error) {
    console.error("Dashboard hatası:", error);
    res.status(500).json({ error: 'Veri alınamadı.' });
  }
};

// --- 8. İŞE AL (HIRE) ---
exports.acceptApplication = async (req, res) => {
  try {
    const { id, appId } = req.params;
    const { uid } = req.user;

    const jobRef = db.collection('jobs').doc(id);
    const jobDoc = await jobRef.get();
    
    if (!jobDoc.exists || jobDoc.data().employerId !== uid) {
      return res.status(403).json({ error: 'Yetkisiz işlem.' });
    }

    const appRef = db.collection('applications').doc(appId);
    const appDoc = await appRef.get();

    if (!appDoc.exists) return res.status(404).json({ error: 'Başvuru bulunamadı.' });

    await db.runTransaction(async (t) => {
      t.update(appRef, { status: 'accepted' });
      t.update(jobRef, { 
        status: 'in_progress',
        assignedWorkerId: appDoc.data().workerId 
      });
    });

    res.status(200).json({ message: 'İşçi işe alındı!' });
  } catch (error) {
    console.error("İşe alım hatası:", error);
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
};

// --- 9. İŞİ TAMAMLA (COMPLETE) ---
exports.completeJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const jobRef = db.collection('jobs').doc(id);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists || jobDoc.data().employerId !== uid) {
      return res.status(403).json({ error: 'Yetkisiz işlem.' });
    }

    await jobRef.update({ status: 'completed' });
    res.status(200).json({ message: 'İş tamamlandı olarak işaretlendi.' });
  } catch (error) {
    console.error("Tamamlama hatası:", error);
    res.status(500).json({ error: 'Hata oluştu.' });
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