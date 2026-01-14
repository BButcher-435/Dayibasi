import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- YENİ

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth(); // <--- Context'ten veriyi ve fonksiyonu al
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Sayfa açıldığında context'teki veriyi forma doldur
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '' // Eğer bio varsa
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

    try {
      // Context üzerinden güncelle (API isteği burada da yapılabilir ama şimdilik state güncelliyoruz)
      // Gerçek projede burada önce axios.put('/users/me') yapılır, sonra updateProfile çağrılır.
      updateProfile(formData);

      setMessage('Profil bilgileriniz başarıyla güncellendi!');
      
      // Hızlıca dashboard'a dön
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (err) {
      setMessage('Güncelleme başarısız!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth: '600px', margin: '30px auto'}}>
      <div style={{background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 15px rgba(0,0,0,0.1)'}}>
        <h2 style={{textAlign: 'center', marginBottom: '30px'}}>Profil Ayarları</h2>
        
        {message && (
          <div style={{
            background: message.includes('başarısız') ? '#f8d7da' : '#d4edda',
            color: message.includes('başarısız') ? '#721c24' : '#155724',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div style={{display: 'flex', gap: '15px'}}>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '600'}}>Ad</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px'}}
              />
            </div>
            
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '600'}}>Soyad</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px'}}
              />
            </div>
          </div>

          <div>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: '600'}}>E-posta</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px'}}
            />
          </div>

          <div>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: '600'}}>Telefon</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="05xx xxx xx xx"
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px'}}
            />
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px'}}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '12px 25px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              İptal
            </button>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 30px',
                background: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;