import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const JobCreate = () => {
  const [form, setForm] = useState({
    title: '', 
    description: '', 
    price: '', 
    category: 'general',
    location: '',
    deadline: ''
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('userToken');
      await axios.post('http://localhost:3000/jobs', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('İlan başarıyla oluşturuldu!');
      navigate('/dashboard');
    } catch (err) {
      alert('İlan oluşturulamadı!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth: '600px', margin: '30px auto', padding: '20px', background: 'white', borderRadius: '8px'}}>
      <h2>Yeni İş İlanı Oluştur</h2>
      
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px'}}>
        <input
          placeholder="İş Başlığı *"
          value={form.title}
          onChange={(e) => setForm({...form, title: e.target.value})}
          required
          style={{padding: '12px', border: '1px solid #ccc', borderRadius: '4px'}}
        />
        
        <textarea
          placeholder="Açıklama *"
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          rows="4"
          required
          style={{padding: '12px', border: '1px solid #ccc', borderRadius: '4px'}}
        />
        
        <div style={{display: 'flex', gap: '15px'}}>
          <input
            type="number"
            placeholder="Bütçe (TL) *"
            value={form.price}
            onChange={(e) => setForm({...form, price: e.target.value})}
            required
            style={{flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '4px'}}
          />
          
          <input
            placeholder="Konum *"
            value={form.location}
            onChange={(e) => setForm({...form, location: e.target.value})}
            required
            style={{flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '4px'}}
          />
        </div>
        
        <select
          value={form.category}
          onChange={(e) => setForm({...form, category: e.target.value})}
          style={{padding: '12px', border: '1px solid #ccc', borderRadius: '4px'}}
        >
          <option value="general">Genel İş</option>
          <option value="tech">Teknoloji</option>
          <option value="cleaning">Temizlik</option>
          <option value="repair">Tamir</option>
          <option value="construction">İnşaat</option>
        </select>
        
        <input
          type="date"
          placeholder="Son Başvuru Tarihi"
          value={form.deadline}
          onChange={(e) => setForm({...form, deadline: e.target.value})}
          style={{padding: '12px', border: '1px solid #ccc', borderRadius: '4px'}}
        />
        
        <button type="submit" disabled={loading} style={{
          padding: '14px',
          background: loading ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          {loading ? 'Oluşturuluyor...' : 'İlanı Yayınla'}
        </button>
      </form>
    </div>
  );
};

export default JobCreate;