import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth(); // AuthContext'ten kullanıcıyı al
  const [jobs, setJobs] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Eğer kullanıcı bilgisi henüz yüklenmediyse bekle
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // 🛑 DÜZELTME 1: Yeni yapıda token ismi sadece 'token'
        const token = localStorage.getItem('token'); 

        // Güvenlik: Token yoksa login'e at
        if (!token) {
          navigate('/login');
          return;
        }

        // 🛑 DÜZELTME 2: Adres '/jobs/dashboard' (Backend ile uyumlu)
        const response = await axios.get('http://localhost:3000/jobs/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Gelen verileri state'e işle
        setJobs(response.data.items || []); 
        setBalance(response.data.balance || 0); 

      } catch (err) {
        console.error("Dashboard verisi çekilemedi:", err);
        // Token süresi dolmuşsa vs. çıkış yaptırılabilir (opsiyonel)
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  // Loading Ekranı
  if (loading) {
    return (
      <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>
        <h3>Yükleniyor...</h3>
      </div>
    );
  }

  // Kullanıcı yoksa (Loading bitti ama user null ise)
  if (!user) return null;

  return (
    <div className="dashboard-container" style={{maxWidth: '1200px', margin: '0 auto', padding: '20px'}}>
      
      {/* --- ÜST KISIM (HEADER) --- */}
      <div className="dashboard-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', flexWrap:'wrap'}}>
        <div>
          <h1 style={{fontSize: '2rem', marginBottom: '5px', color:'#333'}}>Hoşgeldin, {user.fullName || user.firstName}!</h1>
          <p style={{color:'#666'}}>İşlerini buradan yönetebilirsin.</p>
        </div>
        
        <div className="user-badge" style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <div className="role-badge" style={{
            background: user.role === 'employer' ? '#007bff' : '#28a745',
            color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight:'bold'
          }}>
            {user.role === 'worker' ? '👷 İşçi' : '👔 İşveren'}
          </div>
          <div className="balance-badge" style={{
            background: '#ffc107', color: '#333', padding: '8px 16px', borderRadius: '20px', fontWeight:'bold'
          }}>
            💰 {balance} TL
          </div>
        </div>
      </div>

      {/* --- BUTONLAR (ACTIONS) --- */}
      <div className="dashboard-actions" style={{display:'flex', gap:'15px', marginBottom:'40px', flexWrap:'wrap'}}>
        
        {/* Profil Butonu (Herkese Açık) */}
        <Link 
          to={`/profile/${user.uid || user.id}`} 
          className="action-btn" 
          style={{textDecoration:'none', background: '#17a2b8', color:'white', padding:'12px 24px', borderRadius:'8px', fontWeight:'600'}}
        >
          👤 Profilimi Gör
        </Link>

        {user.role === 'employer' ? (
          <>
            <Link to="/job/create" style={{textDecoration:'none', background: '#007bff', color:'white', padding:'12px 24px', borderRadius:'8px', fontWeight:'600'}}>
              🆕 Yeni İlan Oluştur
            </Link>
            {/* İşveren için 'İşçi Ara' butonu opsiyonel, şimdilik kaldırabilir veya tutabilirsin */}
          </>
        ) : (
          <>
            <Link to="/jobs" style={{textDecoration:'none', background: '#28a745', color:'white', padding:'12px 24px', borderRadius:'8px', fontWeight:'600'}}>
              🔍 İş Ara
            </Link>
            <Link to="/account/billing" style={{textDecoration:'none', background: '#6c757d', color:'white', padding:'12px 24px', borderRadius:'8px', fontWeight:'600'}}>
              💳 Para Yükle
            </Link>
          </>
        )}
      </div>

      {/* --- İSTATİSTİKLER --- */}
      <div className="stats-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'20px', marginBottom:'40px'}}>
        <div className="stat-card" style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
          <h3 style={{margin:0, color:'#666', fontSize:'0.9rem'}}>Aktif / Devam Eden</h3>
          <div style={{fontSize:'2rem', fontWeight:'bold', color: '#007bff', marginTop:'10px'}}>
            {jobs.filter(j => j.status === 'active' || j.status === 'in_progress' || j.status === 'accepted').length}
          </div>
        </div>
        <div className="stat-card" style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
          <h3 style={{margin:0, color:'#666', fontSize:'0.9rem'}}>Bekleyen</h3>
          <div style={{fontSize:'2rem', fontWeight:'bold', color: '#ffc107', marginTop:'10px'}}>
            {jobs.filter(j => j.status === 'pending').length}
          </div>
        </div>
        <div className="stat-card" style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
          <h3 style={{margin:0, color:'#666', fontSize:'0.9rem'}}>Tamamlanan</h3>
          <div style={{fontSize:'2rem', fontWeight:'bold', color: '#28a745', marginTop:'10px'}}>
            {jobs.filter(j => j.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* --- LİSTE --- */}
      <div className="list-section">
        <h2 style={{borderBottom:'2px solid #eee', paddingBottom:'10px', marginBottom:'20px'}}>
          {user.role === 'employer' ? 'Yayınladığın İlanlar' : 'Başvuruların'}
        </h2>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
          {jobs.length === 0 && (
            <p style={{color:'#888', fontStyle:'italic'}}>Henüz burada gösterilecek bir kayıt yok.</p>
          )}
          
          {jobs.map(job => (
            <div key={job.id} style={{background:'white', border: '1px solid #e9ecef', borderRadius: '10px', padding: '20px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
              <h3 style={{marginTop: 0, fontSize:'1.2rem', color:'#333'}}>{job.title}</h3>
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems:'center'}}>
                <span style={{fontSize: '18px', fontWeight: 'bold', color: '#28a745'}}>{job.price} TL</span>
                <span style={{
                  background: job.status === 'active' ? '#e3f2fd' : job.status === 'completed' ? '#d4edda' : '#f8f9fa',
                  color: job.status === 'active' ? '#007bff' : job.status === 'completed' ? '#155724' : '#666',
                  padding: '4px 12px', borderRadius: '12px', fontSize: '12px', textTransform:'capitalize'
                }}>
                  {job.status === 'in_progress' ? 'Sürüyor' : job.status}
                </span>
              </div>

              {/* DETAY BUTONU: İşçi ise jobId, İşveren ise id kullanır */}
              <Link 
                to={`/job/${user.role === 'worker' ? job.jobId : job.id}`} 
                style={{
                  display: 'block', textAlign: 'center', background: '#f8f9fa', color: '#007bff', 
                  padding: '10px', borderRadius: '6px', textDecoration: 'none', fontWeight:'600', transition:'background 0.2s'
                }}
              >
                Detayları Gör →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;