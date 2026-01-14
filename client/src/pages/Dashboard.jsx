import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth(); // Context'ten alıyoruz
  const [jobs, setJobs] = useState([]);
  const [balance, setBalance] = useState(1250); // Mock data
  const navigate = useNavigate();

  // useAuth sayesinde useEffect ile token kontrolü yapmaya gerek kalmadı!
  // Ancak user yoksa login'e atabiliriz (opsiyonel, PrivateRoute daha iyi olur)
  useEffect(() => {
    if (!user) {
        // navigate('/login'); // Bu satırı şimdilik kapalı tutuyoruz, Context yüklenirken yönlendirmesin diye
    }
    
    // Mock iş verileri
    setJobs([
      { id: 1, title: 'Bahçe Temizliği', status: 'active', price: 500 },
      { id: 2, title: 'Web Sitesi Yapımı', status: 'pending', price: 1500 },
      { id: 3, title: 'Tadilat İşi', status: 'completed', price: 3000 },
    ]);
  }, [user, navigate]);

  if (!user) return <div>Yükleniyor...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 style={{fontSize: '2rem', marginBottom: '10px'}}>Hoşgeldin, {user.fullName}!</h1>
        <div className="user-badge">
          <div className="role-badge" style={{background: user.role === 'employer' ? '#007bff' : '#28a745'}}>
            {user.role === 'worker' ? '👷 İşçi' : '👔 İşveren'}
          </div>
          <div className="balance-badge">
            Bakiyen: {balance} TL
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        {user.role === 'employer' ? (
          <>
            <Link to="/job/create" className="action-btn btn-primary">
              🆕 Yeni İş İlanı Oluştur
            </Link>
            <Link to="/jobs" className="action-btn btn-secondary">
              🔍 İşçi Ara
            </Link>
          </>
        ) : (
          <>
            <Link to="/jobs" className="action-btn btn-primary">
              🔍 İş Ara
            </Link>
            <Link to="/account/billing" className="action-btn btn-secondary">
              💰 Bakiye Yönetimi
            </Link>
          </>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Aktif İşler</h3>
          <div className="stat-number" style={{color: '#007bff'}}>
            {jobs.filter(j => j.status === 'active').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Bekleyen</h3>
          <div className="stat-number" style={{color: '#ffc107'}}>
            {jobs.filter(j => j.status === 'pending').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Tamamlanan</h3>
          <div className="stat-number" style={{color: '#28a745'}}>
            {jobs.filter(j => j.status === 'completed').length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;