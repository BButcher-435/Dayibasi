import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false); // Başvuru durumu
  const [loadingApply, setLoadingApply] = useState(false); // Buton kilidi
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJob();
    if (user && user.role === 'worker') {
      checkStatus();
    }
  }, [id, user]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/jobs/${id}`);
      setJob(response.data);
    } catch (err) {
      console.error('İş detayı yüklenemedi');
    }
  };

  // Başvuru Durumunu Kontrol Et
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

  const handleApply = async () => {
    // 1. Token ve Yetki Kontrolü
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert("Lütfen önce giriş yapın.");
      navigate('/login');
      return;
    }

    // 2. Butonu Kilitle (Çift tıklamayı önler)
    setLoadingApply(true);

    try {
      await axios.post(`http://localhost:3000/jobs/${id}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Başvurunuz başarıyla alındı!');
      setHasApplied(true); // Durumu güncelle
      fetchJob(); // Başvuru sayısını güncelle

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Başvuru başarısız!';
      alert(errorMsg);
    } finally {
      setLoadingApply(false); // Kilidi aç (ama hasApplied true olduğu için buton yine disabled kalacak)
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
        {/* İŞÇİ İSE VE KENDİ İLANI DEĞİLSE */}
        {isWorker && !isOwner && (
          <button 
            onClick={handleApply} 
            disabled={hasApplied || loadingApply} // Zaten başvurduysa veya yükleniyorsa tık yok
            className="action-btn"
            style={{
              border: 'none', 
              cursor: (hasApplied || loadingApply) ? 'not-allowed' : 'pointer',
              backgroundColor: hasApplied ? '#6c757d' : '#28a745', // Yeşil -> Gri
              color: 'white'
            }}
          >
            {loadingApply ? 'İşleniyor...' : (hasApplied ? '✅ Başvuru Yapıldı' : 'Bu İşe Başvur')}
          </button>
        )}

        {/* İLAN SAHİBİ İSE */}
        {isOwner && (
          <Link to={`/job/${id}/applicants`} className="action-btn" style={{backgroundColor: '#17a2b8'}}>
            Başvuranları Gör ({job.applicantCount || 0})
          </Link>
        )}
      </div>
    </div>
  );
};

export default JobDetail;