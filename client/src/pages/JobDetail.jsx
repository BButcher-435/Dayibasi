import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  // --- PUANLAMA STATE'LERİ ---
  const [ratingScore, setRatingScore] = useState(5); // Varsayılan 5 yıldız
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobRes = await axios.get(`${API_URL}/jobs/${id}`);
        setJob(jobRes.data);
      } catch (err) {
        console.error("Veri çekilemedi", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- BAŞVURU YAP ---
  const handleApply = async () => {
    if (!user) { alert("Giriş yapmalısınız!"); navigate('/login'); return; }
    if (hasApplied) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/jobs/${id}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Başvurunuz alındı!");
      setHasApplied(true);
      navigate('/dashboard');
    } catch (err) {
      alert("⚠️ " + (err.response?.data?.error || "Hata oluştu."));
    }
  };

  // --- İŞİ TAMAMLA ---
  const handleComplete = async () => {
    if (!window.confirm("İşi tamamlayıp parayı aktarmak istiyor musunuz?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/jobs/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ İş tamamlandı ve ücret aktarıldı!");
      window.location.reload(); 
    } catch (err) {
      alert("❌ HATA: " + (err.response?.data?.error || "Hata oluştu."));
    }
  };

  // --- PUAN VER ---
  const handleRate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/jobs/${id}/rate`, {
        score: ratingScore,
        comment: ratingComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("🌟 Değerlendirmeniz kaydedildi!");
      setRatingSubmitted(true);
      setRatingComment('');
    } catch (err) {
      alert("Hata: " + (err.response?.data?.error || "Puan verilemedi."));
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Yükleniyor...</div>;
  if (!job) return <div style={{textAlign: 'center', marginTop: '50px'}}>İlan bulunamadı.</div>;

  const isOwner = user && (user.uid === job.employerId || user.id === job.employerId);
  const isWorker = user && (user.uid === job.assignedWorkerId || user.id === job.assignedWorkerId);
  
  // Sadece bu işin tarafları (İşveren veya Çalışan İşçi) puan verebilir
  const canRate = job.status === 'completed' && (isOwner || isWorker);

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '30px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      
      {/* ÜST BİLGİ */}
      <div style={{borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
           <h1 style={{margin: '0', color: '#333'}}>{job.title}</h1>
           <span style={{
             background: job.status === 'active' ? '#e3f2fd' : job.status === 'completed' ? '#d4edda' : '#f8f9fa',
             color: job.status === 'active' ? '#007bff' : job.status === 'completed' ? '#155724' : '#666',
             padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight:'bold'
           }}>
             {job.status === 'in_progress' ? '⏳ Sürüyor' : job.status === 'active' ? '🟢 Açık' : job.status === 'completed' ? '🏁 Tamamlandı' : '🔒 Kapalı'}
           </span>
        </div>
        <div style={{color: '#666', marginTop:'10px'}}>
          İşveren: <Link to={`/profile/${job.employerId}`} style={{fontWeight: 'bold', color: '#007bff', textDecoration:'none'}}>{job.employerName}</Link>
        </div>
      </div>

      <div style={{marginBottom: '30px', lineHeight: '1.8', color: '#444'}}>
        <h3>İş Tanımı</h3>
        <p>{job.description}</p>
      </div>

      <div style={{background: '#f8f9fa', padding: '25px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#28a745'}}>{job.price} TL</div>

        {isOwner ? (
          <div style={{display: 'flex', gap: '10px'}}>
            <button onClick={() => navigate(`/job/${id}/applicants`)} style={{padding: '12px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              👥 Başvuranlar
            </button>
            {(job.status === 'in_progress' || job.status === 'active') && (
              <button onClick={handleComplete} style={{padding: '12px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
                🏁 İşi Tamamla
              </button>
            )}
          </div>
        ) : (
          job.status === 'active' && (
            <button onClick={handleApply} disabled={hasApplied} style={{padding: '12px 25px', background: hasApplied ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
              {hasApplied ? '✅ Başvuruldu' : '✨ Başvur'}
            </button>
          )
        )}
      </div>

      {/* --- 🔥 YENİ EKLENEN: PUANLAMA KUTUSU --- */}
      {canRate && !ratingSubmitted && (
        <div style={{marginTop: '40px', borderTop: '2px dashed #ddd', paddingTop: '30px'}}>
          <h3 style={{textAlign:'center', color:'#333'}}>✨ İşi Değerlendir ✨</h3>
          <p style={{textAlign:'center', color:'#666'}}>İş tamamlandı. Karşı tarafı değerlendirmek ister misiniz?</p>
          
          <form onSubmit={handleRate} style={{maxWidth:'500px', margin:'0 auto', background:'#fff8e1', padding:'20px', borderRadius:'10px', border:'1px solid #ffe082'}}>
            
            {/* Yıldızlar */}
            <div style={{textAlign:'center', marginBottom:'15px'}}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  onClick={() => setRatingScore(star)}
                  style={{
                    fontSize: '30px', cursor: 'pointer',
                    color: star <= ratingScore ? '#ffc107' : '#e4e5e9',
                    margin: '0 5px'
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea 
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Yorumunuzu yazın (Örn: Çok temiz çalıştı, teşekkürler...)"
              required
              rows="3"
              style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc', marginBottom:'10px', boxSizing:'border-box'}}
            />

            <button type="submit" style={{width:'100%', padding:'12px', background:'#ffc107', color:'#333', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'}}>
              Değerlendirmeyi Gönder
            </button>
          </form>
        </div>
      )}

      {ratingSubmitted && (
        <div style={{marginTop: '40px', textAlign:'center', color:'green', padding:'20px', background:'#d4edda', borderRadius:'8px'}}>
          ✅ Değerlendirmeniz için teşekkürler!
        </div>
      )}

    </div>
  );
};

export default JobDetail;