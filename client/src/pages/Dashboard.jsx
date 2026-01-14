import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Axios ekle
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [balance, setBalance] = useState(1250); // Bakiye hala mock kalabilir
  const [loading, setLoading] = useState(true); // Yükleniyor durumu
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        // Backend'den verileri çek
        const response = await axios.get('http://localhost:3000/jobs/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setJobs(response.data.items); // Gelen iş/başvuru listesi
      } catch (err) {
        console.error("Dashboard verisi çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user || loading) return <div className="spinner"></div>; // Loading göstergesi

  return (
    <div className="dashboard-container">
      {/* ... (Header ve Badge kısımları aynı kalabilir) ... */}
      <div className="dashboard-header">
        <h1 style={{fontSize: '2rem', marginBottom: '10px'}}>Hoşgeldin, {user.fullName}!</h1>
        <div className="user-badge">
          <div className="role-badge" style={{background: user.role === 'employer' ? '#007bff' : '#28a745'}}>
            {user.role === 'worker' ? '👷 İşçi' : '👔 İşveren'}
          </div>
          <div className="balance-badge">Bakiyen: {balance} TL</div>
        </div>
      </div>

      <div className="dashboard-actions">
        {/* ... (Butonlar aynı kalabilir) ... */}
        {user.role === 'employer' ? (
          <>
            <Link to="/job/create" className="action-btn btn-primary">🆕 Yeni İş İlanı</Link>
            <Link to="/jobs" className="action-btn btn-secondary">🔍 İşçi Ara</Link>
          </>
        ) : (
          <>
            <Link to="/jobs" className="action-btn btn-primary">🔍 İş Ara</Link>
            <Link to="/account/billing" className="action-btn btn-secondary">💰 Bakiye</Link>
          </>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Aktif / Devam Eden</h3>
          <div className="stat-number" style={{color: '#007bff'}}>
            {jobs.filter(j => j.status === 'active' || j.status === 'accepted').length}
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
            {jobs.filter(j => j.status === 'completed' || j.status === 'rejected').length}
          </div>
        </div>
      </div>

      <div className="stat-card" style={{marginTop: '20px'}}>
        <h2>{user.role === 'employer' ? 'Son İlanların' : 'Son Başvuruların'}</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
          {jobs.length === 0 && <p>Henüz kayıt bulunamadı.</p>}
          
          {jobs.map(job => (
            <div key={job.id} style={{border: '1px solid #e9ecef', borderRadius: '8px', padding: '20px'}}>
              <h3 style={{marginTop: 0}}>{job.title}</h3>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                <span style={{fontSize: '20px', fontWeight: 'bold', color: '#28a745'}}>{job.price} TL</span>
                <span style={{
                  background: '#eee', padding: '4px 12px', borderRadius: '12px', fontSize: '12px'
                }}>
                  {job.status}
                </span>
              </div>
              {/* İşveren ise ilana git, İşçi ise ilana git (ama ID application değil job ID olmalı) */}
              <Link to={`/job/${user.role === 'worker' ? job.jobId : job.id}`} style={{
                display: 'block', textAlign: 'center', background: '#f8f9fa', color: '#007bff', padding: '10px', borderRadius: '6px', textDecoration: 'none'
              }}>
                Detayları Gör
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;