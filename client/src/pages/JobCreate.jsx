import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // ✅ Yeni: AuthContext eklendi

const JobCreate = () => {
  const { user } = useAuth(); // Kullanıcı bilgisini çekiyoruz (Gerekirse diye)
  
  const [form, setForm] = useState({
    title: '', 
    description: '', 
    price: '', 
    category: 'general', // Varsayılan
    location: '',
    deadline: ''
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Yeni Backend Adresi (Lokalde çalışıyorsan)
  const API_URL = 'http://localhost:3000'; 
  const today = new Date().toISOString().split('T')[0];

  // 📋 GENİŞLETİLMİŞ KATEGORİ LİSTESİ (Aynen korundu)
  const categories = [
    { value: 'general', label: '🛠️ Genel İş' },
    { value: 'tech', label: '💻 Yazılım & Teknoloji' },
    { value: 'cleaning', label: '🧹 Temizlik & Düzen' },
    { value: 'repair', label: '🔧 Tamir & Tadilat' },
    { value: 'construction', label: '🏗️ İnşaat & Boya' },
    { value: 'transport', label: '🚚 Nakliye & Taşıma' },
    { value: 'education', label: '📚 Özel Ders & Eğitim' },
    { value: 'design', label: '🎨 Tasarım & Yaratıcı' },
    { value: 'pet', label: '🐾 Evcil Hayvan Bakımı' },
    { value: 'garden', label: '🌱 Bahçe & Peyzaj' },
    { value: 'health', label: '🩺 Sağlık & Bakım' },
    { value: 'event', label: '🎉 Organizasyon & Etkinlik' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.deadline && form.deadline < today) {
      alert("Hata: Geçmiş bir tarihe ilan veremezsiniz!");
      setLoading(false);
      return;
    }
    
    try {
      // 🛑 DÜZELTME: Token artık 'userToken' değil 'token' olarak kaydediliyor.
      // (Yeni AuthContext yapımıza uygun hale getirildi)
      const token = localStorage.getItem('token'); 

      if (!token) {
        alert("Oturum süreniz dolmuş, lütfen tekrar giriş yapın.");
        navigate('/login');
        return;
      }

      // 🛑 DÜZELTME: Adres '/jobs' (Backend rotamıza uygun)
      // Authorization Header'ı eklendi
      await axios.post(`${API_URL}/jobs`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('İlan başarıyla oluşturuldu!');
      navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      // Hata mesajını daha düzgün göstermek için
      if (err.response && err.response.status === 401) {
          alert("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
          navigate('/login');
      } else {
          const errorMsg = err.response?.data?.error || 'İlan oluşturulamadı!';
          alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // 👇 TASARIM KISMI (SENİN GÖNDERDİĞİNİN AYNISI)
  return (
    <div style={{maxWidth: '600px', margin: '30px auto', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
      <h2 style={{textAlign: 'center', marginBottom: '20px', color: '#333'}}>Yeni İş İlanı Oluştur</h2>
      
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <div>
          <label style={{display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold'}}>İş Başlığı</label>
          <input
            placeholder="Örn: Ev taşıma yardımı aranıyor"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            required
            style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box'}}
          />
        </div>
        
        <div>
          <label style={{display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold'}}>Açıklama</label>
          <textarea
            placeholder="İşin detaylarını buraya yazın..."
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            rows="5"
            required
            style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box'}}
          />
        </div>
        
        <div style={{display: 'flex', gap: '15px'}}>
          <div style={{flex: 1}}>
             <label style={{display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold'}}>Bütçe (TL)</label>
             <input
              type="number"
              placeholder="5000"
              value={form.price}
              onChange={(e) => setForm({...form, price: e.target.value})}
              required
              min="1"
              style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box'}}
            />
          </div>
          
          <div style={{flex: 1}}>
             <label style={{display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold'}}>Konum</label>
             <input
              placeholder="Şehir / İlçe"
              value={form.location}
              onChange={(e) => setForm({...form, location: e.target.value})}
              required
              style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box'}}
            />
          </div>
        </div>
        
        <div style={{display: 'flex', gap: '15px'}}>
           <div style={{flex: 1}}>
             <label style={{display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold'}}>Kategori</label>
             <select
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
              style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', boxSizing: 'border-box'}}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
           </div>

           <div style={{flex: 1}}>
             <label style={{display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold'}}>Son Başvuru</label>
             <input
              type="date"
              min={today}
              value={form.deadline}
              onChange={(e) => setForm({...form, deadline: e.target.value})}
              style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box'}}
            />
           </div>
        </div>
        
        <button type="submit" disabled={loading} style={{
          marginTop: '10px',
          padding: '14px',
          background: loading ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          {loading ? 'Yayınlanıyor...' : '✨ İlanı Yayınla'}
        </button>
      </form>
    </div>
  );
};

export default JobCreate;