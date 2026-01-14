import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import JobCreate from './pages/JobCreate';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import Billing from './pages/Billing';
import Dispute from './pages/Dispute';
import Rating from './pages/Rating';
import ProfileSettings from './pages/ProfileSettings';
import Applicants from './pages/Applicants'; // [YENİ]
// PROFİL DROPDOWN
const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const userName = localStorage.getItem('userName') || 'Kullanıcı';
  const userRole = localStorage.getItem('userRole') || 'worker';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  return (
    <div style={{position: 'relative'}}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '25px',
          padding: '6px 15px',
          cursor: 'pointer'
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          background: '#007bff',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          {userInitial}
        </div>
        <span style={{fontWeight: '500'}}>
          {userName.split(' ')[0]}
        </span>
        <span style={{fontSize: '10px'}}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '45px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          minWidth: '220px',
          zIndex: 1000
        }}>
          <div style={{padding: '15px', borderBottom: '1px solid #eee'}}>
            <div style={{fontWeight: 'bold'}}>{userName}</div>
            <div style={{fontSize: '12px', color: '#666'}}>
              {userRole === 'worker' ? ' İşçi' : ' İşveren'}
            </div>
          </div>
          
          <Link 
            to="/profile" 
            style={{
              display: 'block',
              padding: '12px 15px',
              textDecoration: 'none',
              color: '#333',
              borderBottom: '1px solid #f5f5f5'
            }}
            onClick={() => setIsOpen(false)}
          >
            👤 Profil Ayarları
          </Link>
          
          <Link 
            to="/dashboard" 
            style={{
              display: 'block',
              padding: '12px 15px',
              textDecoration: 'none',
              color: '#333',
              borderBottom: '1px solid #f5f5f5'
            }}
            onClick={() => setIsOpen(false)}
          >
            📊 Dashboard
          </Link>
          
          <Link 
            to="/account/billing" 
            style={{
              display: 'block',
              padding: '12px 15px',
              textDecoration: 'none',
              color: '#333',
              borderBottom: '1px solid #f5f5f5'
            }}
            onClick={() => setIsOpen(false)}
          >
            💰 Bakiye
          </Link>
          
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px 15px',
              background: 'transparent',
              border: 'none',
              color: '#dc3545',
              textAlign: 'left',
              cursor: 'pointer',
              borderTop: '1px solid #eee'
            }}
          >
            🚪 Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
};

// NAVBAR
const Navbar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    
    const hasToken = token && token !== 'null' && token !== '';
    setIsLoggedIn(hasToken);
    setUserRole(role || '');
  }, [location]);

  if (!isLoggedIn) {
    return (
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        height: '60px',
        background: 'white',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div>
          <Link to="/" style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#2c3e50',
            textDecoration: 'none'
          }}>
             İş Platformu
          </Link>
        </div>
        <div style={{display: 'flex', gap: '15px'}}>
          <Link to="/login" style={{
            color: '#007bff',
            textDecoration: 'none',
            padding: '8px 16px',
            border: '1px solid #007bff',
            borderRadius: '4px'
          }}>
            Giriş Yap
          </Link>
          <Link to="/register" style={{
            background: '#28a745',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            textDecoration: 'none'
          }}>
            Kayıt Ol
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      height: '60px',
      background: 'white',
      borderBottom: '1px solid #e0e0e0'
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: '25px'}}>
        <Link to="/" style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#2c3e50',
          textDecoration: 'none'
        }}>
          🛠️ İş Platformu
        </Link>
        <Link to="/dashboard" style={{color: '#555', textDecoration: 'none'}}>
          Ana Sayfa
        </Link>
        <Link to="/jobs" style={{color: '#555', textDecoration: 'none'}}>
          İşler
        </Link>
        {userRole === 'employer' && (
          <Link to="/job/create" style={{color: '#555', textDecoration: 'none'}}>
            İlan Ver
          </Link>
        )}
      </div>
      <div>
        <ProfileDropdown />
      </div>
    </nav>
  );
};

// ANA UYGULAMA
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{padding: '20px', minHeight: 'calc(100vh - 60px)', background: '#f8f9fa'}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/job/create" element={<JobCreate />} />
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/account/billing" element={<Billing />} />
          <Route path="/job/:id/dispute" element={<Dispute />} />
          <Route path="/job/:id/rate" element={<Rating />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/job/:id/applicants" element={<Applicants />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// ANA SAYFA
const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  return <div style={{textAlign: 'center', padding: '50px'}}>Yönlendiriliyor...</div>;
};

export default App;