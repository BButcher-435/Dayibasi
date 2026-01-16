import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Backend rotası genelde /auth/login olur.
      // Eğer çalışmazsa '/auth' kısmını silebilirsin ama backend yapımıza göre doğrusu bu.
      const response = await axios.post('http://localhost:3000/auth/login', {
        email: email,
        password: password
      });

      // 🛑 KİLİT DÜZELTME BURADA YAPILDI:
      // Backend'den gelen veri şu yapıda: { message: '...', token: '...', user: { ... } }
      // Bizim bu veriyi parçalayıp (destructuring) içinden user ve token'ı almamız lazım.
      const { token, user } = response.data;

      // Şimdi Context'e ve LocalStorage'a gidecek olan temiz veriyi oluşturuyoruz.
      // Böylece user.firstName dediğinde "undefined" değil, gerçek ismini göreceksin.
      const userDataToSave = { ...user, token };

      login(userDataToSave); 

      navigate('/dashboard');

    } catch (err) {
      console.error(err); 
      setError(err.response?.data?.error || 'Giriş yapılamadı! Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  // 👇 TASARIM KISMI HİÇ DEĞİŞTİRİLMEDİ (Senin kodunun aynısı)
  return (
    <div style={{maxWidth: '400px', margin: '50px auto'}}>
      <div style={{background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
        <h2 style={{textAlign: 'center', marginBottom: '30px'}}>Giriş Yap</h2>
        
        {error && <div style={{background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '20px'}}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <input 
            type="email" 
            placeholder="E-posta" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}}
          />
          <input 
            type="password" 
            placeholder="Şifre" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '14px',
              background: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        
        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <p>
            Hesabın yok mu? <Link to="/register" style={{color: '#007bff'}}>Kayıt Ol</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;