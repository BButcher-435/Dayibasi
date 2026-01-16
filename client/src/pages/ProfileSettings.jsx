import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth(); // Context'ten verileri al
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Sayfa açılınca mevcut bilgileri forma doldur
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '' // Biyografi varsa getir
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Oturum süresi dolmuş.");

      // 🛑 DÜZELTME: Doğru adrese istek atıyoruz
      const response = await axios.put('http://localhost:3000/auth/update-profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Başarılı! Context'teki kullanıcı bilgisini de güncelle (Anında yansısın)
      if (updateProfile) {
        updateProfile(response.data.user);
      }

      setMessage('✅ Profiliniz başarıyla güncellendi!');
      
      // 1.5 saniye sonra profil sayfasına yönlendir
      setTimeout(() => {
        navigate(`/profile/${user.uid || user.id}`);
      }, 1500);

    } catch (err) {
      console.error(err);
      setError('❌ Güncelleme sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Profil Ayarları</h2>

      {message && <div style={{ background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{message}</div>}
      {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Ad</label>
            <input 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing:'border-box' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Soyad</label>
            <input 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing:'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Telefon</label>
          <input 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="0555..." 
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing:'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Biyografi (Hakkımda)</label>
          <textarea 
            name="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            placeholder="Kendinizden kısaca bahsedin..." 
            rows="4" 
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontFamily: 'inherit', boxSizing:'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            marginTop: '10px',
            padding: '12px',
            background: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {loading ? 'Kaydediliyor...' : '💾 Değişiklikleri Kaydet'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;