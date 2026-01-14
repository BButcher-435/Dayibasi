import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate ekle
import axios from 'axios';

const Applicants = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Yönlendirme için
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await axios.get(`http://localhost:3000/jobs/${id}/applicants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplicants(response.data);
      } catch (err) {
        console.error("Başvuranlar çekilemedi");
      }
    };
    fetchApplicants();
  }, [id]);

  // İşe Alma Fonksiyonu
  const handleHire = async (appId) => {
    if (!window.confirm("Bu kişiyi işe almak istediğinize emin misiniz?")) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      await axios.post(`http://localhost:3000/jobs/${id}/accept/${appId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("İşçi başarıyla işe alındı!");
      navigate('/dashboard'); // Dashboard'a dön
    } catch (err) {
      alert("İşe alım başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      <h2>Başvuranlar</h2>
      {applicants.length === 0 ? <p>Henüz başvuru yok.</p> : (
        <div style={{display: 'grid', gap: '15px'}}>
          {applicants.map(app => (
            <div key={app.id} style={{
              border: '1px solid #ddd', padding: '15px', borderRadius: '8px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white'
            }}>
              <div>
                <strong>{app.workerName}</strong>
                <div style={{fontSize: '12px', color: '#666'}}>{new Date(app.appliedAt).toLocaleDateString()}</div>
                <div style={{marginTop: '5px', color: app.status === 'accepted' ? 'green' : 'orange'}}>
                  Durum: {app.status === 'accepted' ? '✅ İşe Alındı' : '⏳ Bekliyor'}
                </div>
              </div>
              
              {/* Sadece kabul edilmemişse butonu göster */}
              {app.status !== 'accepted' && (
                <button 
                  onClick={() => handleHire(app.id)}
                  disabled={loading}
                  style={{
                    background: '#28a745', color: 'white', border: 'none', 
                    padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'
                  }}
                >
                  {loading ? 'İşleniyor...' : 'İşe Al'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applicants;