import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState({});
  const [jobs, setJobs] = useState([]);
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const userName = localStorage.getItem('userName') || 'Kullanıcı';
    const userRole = localStorage.getItem('userRole') || 'worker';
    
    console.log("Dashboard'da Rol:", userRole); // DEBUG
    
    setUser({
      name: userName,
      role: userRole,
    });

    setBalance(1250);

    setJobs([
      { id: 1, title: 'Bahçe Temizliği', status: 'active', price: 500, category: 'temizlik' },
      { id: 2, title: 'Web Sitesi Yapımı', status: 'pending', price: 1500, category: 'teknoloji' },
      { id: 3, title: 'Tadilat İşi', status: 'completed', price: 3000, category: 'inşaat' },
    ]);
  }, [navigate]);

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px'}}>
      <div style={{marginBottom: '30px'}}>
        <h1 style={{fontSize: '2rem', marginBottom: '10px'}}>Hoşgeldin, {user.name}!</h1>
        <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
          <div style={{
            background: user.role === 'employer' ? '#007bff' : '#28a745',
            color: 'white',
            padding: '6px 15px',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            {user.role === 'worker' ? '👷 İşçi' : '👔 İşveren'}
          </div>
          <div style={{background: '#28a745', color: 'white', padding: '8px 20px', borderRadius: '20px'}}>
            Bakiyen: {balance} TL
          </div>
        </div>
      </div>

      <div style={{display: 'flex', gap: '15px', marginBottom: '30px'}}>
        {user.role === 'employer' ? (
          <>
            <Link to="/job/create" style={{
              background: '#007bff',
              color: 'white',
              padding: '12px 25px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              🆕 Yeni İş İlanı Oluştur
            </Link>
            <Link to="/jobs" style={{
              background: '#6c757d',
              color: 'white',
              padding: '12px 25px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              🔍 İşçi Ara
            </Link>
          </>
        ) : (
          <>
            <Link to="/jobs" style={{
              background: '#007bff',
              color: 'white',
              padding: '12px 25px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              🔍 İş Ara
            </Link>
            <Link to="/account/billing" style={{
              background: '#6c757d',
              color: 'white',
              padding: '12px 25px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              💰 Bakiye Yönetimi
            </Link>
          </>
        )}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px'}}>
        <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)'}}>
          <h3>Aktif İşler</h3>
          <div style={{fontSize: '2em', fontWeight: 'bold', color: '#007bff'}}>
            {jobs.filter(j => j.status === 'active').length}
          </div>
        </div>
        <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)'}}>
          <h3>Bekleyen</h3>
          <div style={{fontSize: '2em', fontWeight: 'bold', color: '#ffc107'}}>
            {jobs.filter(j => j.status === 'pending').length}
          </div>
        </div>
        <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)'}}>
          <h3>Tamamlanan</h3>
          <div style={{fontSize: '2em', fontWeight: 'bold', color: '#28a745'}}>
            {jobs.filter(j => j.status === 'completed').length}
          </div>
        </div>
      </div>

      <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)'}}>
        <h2>Son İşlerin</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
          {jobs.map(job => (
            <div key={job.id} style={{border: '1px solid #e9ecef', borderRadius: '8px', padding: '20px'}}>
              <h3 style={{marginTop: 0}}>{job.title}</h3>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                <span style={{fontSize: '20px', fontWeight: 'bold', color: '#28a745'}}>{job.price} TL</span>
                <span style={{
                  background: job.status === 'active' ? '#d4edda' : job.status === 'pending' ? '#fff3cd' : '#f8d7da',
                  color: job.status === 'active' ? '#155724' : job.status === 'pending' ? '#856404' : '#721c24',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {job.status === 'active' ? 'Aktif' : job.status === 'pending' ? 'Bekliyor' : 'Tamamlandı'}
                </span>
              </div>
              <Link to={`/job/${job.id}`} style={{
                display: 'block',
                textAlign: 'center',
                background: '#f8f9fa',
                color: '#007bff',
                padding: '10px',
                borderRadius: '6px',
                textDecoration: 'none'
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