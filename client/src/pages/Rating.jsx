import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Rating = () => {
  const { id } = useParams(); // Job ID
  const navigate = useNavigate();
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      await axios.post(`http://localhost:3000/jobs/${id}/rate`, 
        { score, comment }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Puanınız kaydedildi, teşekkürler!");
      navigate('/dashboard');
    } catch (err) {
      alert("Puan verilemedi: " + (err.response?.data?.error || "Hata"));
    }
  };

  return (
    <div style={{maxWidth: '500px', margin: '50px auto', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
      <h2>İşi Puanla</h2>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        <div>
          <label>Puanınız (1-5):</label>
          <select 
            value={score} 
            onChange={e => setScore(e.target.value)}
            style={{width: '100%', padding: '10px', marginTop: '5px'}}
          >
            <option value="5">⭐⭐⭐⭐⭐ (Mükemmel)</option>
            <option value="4">⭐⭐⭐⭐ (İyi)</option>
            <option value="3">⭐⭐⭐ (Orta)</option>
            <option value="2">⭐⭐ (Kötü)</option>
            <option value="1">⭐ (Berbat)</option>
          </select>
        </div>
        
        <div>
          <label>Yorumunuz:</label>
          <textarea 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            rows="4"
            placeholder="Deneyiminiz nasıldı?"
            style={{width: '100%', padding: '10px', marginTop: '5px'}}
          />
        </div>

        <button type="submit" style={{background: '#6f42c1', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
          Puanı Gönder
        </button>
      </form>
    </div>
  );
};

export default Rating;