import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // ✅ YENİ SİSTEM BAĞLANDI

// Sayfa Importları
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
import Applicants from './pages/Applicants';
import UserProfile from './pages/UserProfile';

// --- 1. PROFİL DROPDOWN (CONTEXT İLE GÜNCELLENDİ) ---
const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Context'ten veriyi al

  // Eğer kullanıcı verisi henüz yüklenmediyse gösterme
  if (!user) return null;

  const handleLogout = () => {
    logout(); // Context'teki logout fonksiyonunu kullan
    setIsOpen(false);
    navigate('/login');
  };

  // İsim ve Rol ayarları
  const displayName = user.firstName || 'Kullanıcı';
  const userInitial = displayName.charAt(0).toUpperCase();
  const displayRole = user.role === 'worker' ? 'İşçi' : 'İşveren';

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'white', border: '1px solid #ddd',
          borderRadius: '25px', padding: '6px 15px', cursor: 'pointer'
        }}
      >
        <div style={{
          width: '32px', height: '32px', background: '#007bff', color: 'white',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
        }}>
          {userInitial}
        </div>
        <span style={{ fontWeight: '500' }}>{displayName}</span>
        <span style={{ fontSize: '10px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, top: '45px', background: 'white',
          border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          minWidth: '220px', zIndex: 1000
        }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
            <div style={{ fontWeight: 'bold' }}>{user.fullName || displayName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{displayRole}</div>
          </div>
          
          <Link to={`/profile/${user.uid || user.id}`} onClick={() => setIsOpen(false)} style={dropdownLinkStyle}>
             👤 Profilim
          </Link>
          <Link to="/profile" onClick={() => setIsOpen(false)} style={dropdownLinkStyle}>
             ⚙️ Ayarlar
          </Link>
          <Link to="/dashboard" onClick={() => setIsOpen(false)} style={dropdownLinkStyle}>
             📊 Dashboard
          </Link>
          <Link to="/account/billing" onClick={() => setIsOpen(false)} style={dropdownLinkStyle}>
             💰 Bakiye: {user.balance || 0} TL
          </Link>
          
          <button onClick={handleLogout} style={{
            width: '100%', padding: '12px 15px', background: 'transparent',
            border: 'none', color: '#dc3545', textAlign: 'left', cursor: 'pointer', borderTop: '1px solid #eee'
          }}>
            🚪 Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
};

// Dropdown link stili
const dropdownLinkStyle = {
  display: 'block', padding: '12px 15px', textDecoration: 'none',
  color: '#333', borderBottom: '1px solid #f5f5f5'
};

// --- 2. NAVBAR (CONTEXT İLE GÜNCELLENDİ) ---
const Navbar = () => {
  const { user } = useAuth(); // Artık localStorage değil, canlı user verisi dinleniyor

  // GİRİŞ YAPMAMIŞSA
  if (!user) {
    return (
      <nav style={navStyle}>
        <div>
          <Link to="/" style={logoStyle}>İş Platformu</Link>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/login" style={loginBtnStyle}>Giriş Yap</Link>
          <Link to="/register" style={registerBtnStyle}>Kayıt Ol</Link>
        </div>
      </nav>
    );
  }

  // GİRİŞ YAPMIŞSA
  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        <Link to="/" style={logoStyle}>🛠️ İş Platformu</Link>
        <Link to="/dashboard" style={linkStyle}>Ana Sayfa</Link>
        <Link to="/jobs" style={linkStyle}>İlanlar</Link>
        {user.role === 'employer' && (
          <Link to="/job/create" style={linkStyle}>İlan Ver</Link>
        )}
      </div>
      <div>
        <ProfileDropdown />
      </div>
    </nav>
  );
};

// Basit stiller
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', height: '60px', background: 'white', borderBottom: '1px solid #e0e0e0' };
const logoStyle = { fontSize: '20px', fontWeight: 'bold', color: '#2c3e50', textDecoration: 'none' };
const linkStyle = { color: '#555', textDecoration: 'none', fontWeight: '500' };
const loginBtnStyle = { color: '#007bff', textDecoration: 'none', padding: '8px 16px', border: '1px solid #007bff', borderRadius: '4px' };
const registerBtnStyle = { background: '#28a745', color: 'white', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' };

// --- 3. YÖNLENDİRME BİLEŞENİ ---
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  return <div style={{ textAlign: 'center', padding: '50px' }}>Yönlendiriliyor...</div>;
};

// --- 4. ANA UYGULAMA (AUTH PROVIDER İLE SARMALANDI) ---
function App() {
  return (
    // 🔥 EN ÖNEMLİ KISIM: AuthProvider Bütün Uygulamayı Sarıyor
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div style={{ padding: '20px', minHeight: 'calc(100vh - 60px)', background: '#f8f9fa' }}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
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
            <Route path="/profile/:id" element={<UserProfile />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;