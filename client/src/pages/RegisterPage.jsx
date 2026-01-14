import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '', 
    password: '', 
    firstName: '', 
    lastName: '', 
    phone: '', 
    role: 'worker'
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Kayıt başarısız');
      }

      // LOCALSTORAGE'A KAYDET
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userUid', data.uid);
      localStorage.setItem('userFirstName', formData.firstName);
      localStorage.setItem('userLastName', formData.lastName);
      localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
      localStorage.setItem('userRole', formData.role); // FORMDA SEÇİLEN ROLE'Ü KAYDET
      localStorage.setItem('userEmail', formData.email);
      
      console.log("KAYDEDİLEN ROLE:", formData.role); // DEBUG

      setMessage('Kayıt Başarılı!');
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (err) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth: '500px', margin: '30px auto'}}>
      <div style={{background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
        <h2 style={{textAlign: 'center', marginBottom: '25px'}}>Kayıt Ol</h2>
        
        {message && <div style={{background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '6px', marginBottom: '20px'}}>{message}</div>}
        {error && <div style={{background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '6px', marginBottom: '20px'}}>{error}</div>}
        
        <form onSubmit={handleRegister} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <div style={{display: 'flex', gap: '15px'}}>
            <input 
              name="firstName" 
              placeholder="Ad" 
              value={formData.firstName}
              onChange={handleChange} 
              required 
              style={{flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}}
            />
            <input 
              name="lastName" 
              placeholder="Soyad" 
              value={formData.lastName}
              onChange={handleChange} 
              required 
              style={{flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}}
            />
          </div>
          
          <input 
            name="phone" 
            placeholder="Telefon" 
            value={formData.phone}
            onChange={handleChange} 
            required 
            style={{padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}}
          />
          
          <input 
            name="email" 
            type="email" 
            placeholder="E-posta" 
            value={formData.email}
            onChange={handleChange} 
            required 
            style={{padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}}
          />
          
          <input 
            name="password" 
            type="password" 
            placeholder="Şifre (en az 6 karakter)" 
            value={formData.password}
            onChange={handleChange} 
            required 
            style={{padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}}
          />
          
          <div>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Üyelik Tipi:</label>
            <select 
              name="role" 
              value={formData.role}
              onChange={handleChange} 
              style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}}
            >
              <option value="worker">İşçi (İş Arıyorum)</option>
              <option value="employer">İşveren (İş Veriyorum)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{
              padding: '14px',
              background: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>
        
        <p style={{textAlign: 'center', marginTop: '20px'}}>
          Zaten hesabınız var mı? <Link to="/login" style={{color: '#007bff'}}>Giriş Yapın</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;