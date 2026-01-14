import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false); // İşçinin başvuru durumu
  const [loadingApply, setLoadingApply] = useState(false); // Buton yükleme kilidi

  useEffect(() => {
    fetchJob();
    if (user && user.role === 'worker') {
      checkStatus();
    }
  }, [id, user]);

  // İlan detaylarını çek
  const fetchJob = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/jobs/${id}`);
      setJob(response.data);
    } catch (err) {
      console.error('İş detayı yüklenemedi');
    }
  };

  // İşçinin bu ilana daha önce başvurup başvurmadığını kontrol et
  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get(`http://localhost:3000/jobs/${id}/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasApplied(response.data.hasApplied);
    } catch (err) {
      console.error("Durum kontrolü başarısız");
    }
  };

  // İş Tamamlama Fonksiyonu (İşveren için)
  const handleComplete = async () => {
    if (!window.confirm("İşi tamamlandı olarak işaretlemek istiyor musunuz?")) return;
    try {
      const token = localStorage.getItem('userToken');
      await axios.post(`http://localhost:3000/jobs/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("İş tamamlandı! Şimdi puan verebilirsiniz.");
      fetchJob(); // Sayfayı yenileyerek durum güncellenir
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  // İşe Başvuru Fonksiyonu (İşçi için)
  const handleApply = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert("Lütfen önce giriş yapın.");
      navigate('/login');
      return;
    }

    setLoadingApply(true); // Çift tıklamayı önlemek için kilitle

    try {
      await axios.post(`http://localhost:3000/jobs/${id}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Başvurunuz başarıyla alındı!');
      setHasApplied(true); 
      fetchJob(); 
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Başvuru başarısız!';
      alert(errorMsg);
    } finally {
      setLoadingApply(false); 
    }
  };

  if (!job) return <div>Yükleniyor...</div>;

  const isOwner = user && user.uid === job.employerId;
  const isWorker = user && user.role === 'worker';

  return (
    <div className="detail-container">
      <h2>{job.title}</h2>
      <p style={{margin: '20px 0', lineHeight: '1.6'}}>{job.description}</p>
      
      <div className="detail-meta">
        <span>💰 {job.price} TL</span>
        <span>📍 {job.location}</span>
        <span>📅 {job.deadline || 'Belirtilmedi'}</span>
        <span>👥 <strong>{job.applicantCount || 0} Başvuru</strong></span>
      </div>

      <div className="detail-actions">
        {/* İŞÇİ BUTONLARI */}
        {isWorker && !isOwner && (
          <button 
            onClick={handleApply} 
            disabled={hasApplied || loadingApply} 
            className="action-btn"
            style={{
              border: 'none', 
              cursor: (hasApplied || loadingApply) ? 'not-allowed' : 'pointer',
              backgroundColor: hasApplied ? '#6c757d' : '#28a745',
              color: 'white'
            }}
          >
            {loadingApply ? 'İşleniyor...' : (hasApplied ? '✅ Başvuru Yapıldı' : 'Bu İşe Başvur')}
          </button>
        )}

        {/* İŞVEREN BUTONLARI */}
        {isOwner && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to={`/job/${id}/applicants`} className="action-btn" style={{backgroundColor: '#17a2b8'}}>
              Başvuranları Gör ({job.applicantCount || 0})
            </Link>
            
            {/* İş devam ediyorsa Tamamla butonu göster */}
            {job.status === 'in_progress' && (
              <button onClick={handleComplete} className="action-btn" style={{background: '#ffc107', color: 'black', border:'none', cursor:'pointer'}}>
                🏁 İşi Tamamla
              </button>
            )}
          </div>
        )}

        {/* PUAN VERME BUTONU (İş bittiyse hem işveren hem atanan işçi görebilir) */}
        {job.status === 'completed' && (isOwner || (user && user.uid === job.assignedWorkerId)) && (
           <Link to={`/rate/${job.id}`} className="action-btn" style={{background: '#6f42c1', color: 'white'}}>
             ⭐ Puan Ver
           </Link>
        )}
      </div>
    </div>
  );
};

export default JobDetail;