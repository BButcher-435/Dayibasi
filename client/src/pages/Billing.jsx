import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // ✅ Yeni sistem

const Billing = () => {
  const { user, updateProfile } = useAuth(); // Bakiyeyi güncellemek için updateProfile lazım
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Giriş yapmalısınız.");

      // 🛑 DÜZELTME: Adres '/auth/deposit'
      const response = await axios.post('http://localhost:3000/auth/deposit', {
        amount: parseFloat(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Backend'den başarılı yanıt gelince Context'teki bakiyeyi güncelle
      // (Böylece sayfayı yenilemeden sağ üstteki bakiye artar)
      const newBalance = (user.balance || 0) + parseFloat(amount);
      
      // Kullanıcı verisini güncelle (sadece bakiye değişti)
      updateProfile({ balance: newBalance });

      setMessage(`Başarılı! ${amount} TL hesabınıza yüklendi.`);
      setAmount('');

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Yükleme işlemi başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth: '500px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}>
      <h2 style={{textAlign: 'center', marginBottom: '20px', color: '#333'}}>Bakiye Yükle</h2>
      
      <div style={{textAlign: 'center', marginBottom: '30px'}}>
        <span style={{fontSize: '14px', color: '#666'}}>Mevcut Bakiyeniz:</span>
        <div style={{fontSize: '32px', fontWeight: 'bold', color: '#28a745'}}>
          {user?.balance || 0} TL
        </div>
      </div>

      {message && <div style={{background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '6px', marginBottom: '20px'}}>{message}</div>}
      {error && <div style={{background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '6px', marginBottom: '20px'}}>{error}</div>}

      <form onSubmit={handleDeposit}>
        <label style={{display: 'block', marginBottom: '10px', fontWeight: '500'}}>Yüklenecek Tutar (TL)</label>
        <input 
          type="number" 
          placeholder="Örn: 100" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          min="1"
          required 
          style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '20px', boxSizing:'border-box'}}
        />

        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'İşleniyor...' : '💳 Güvenli Ödeme Yap'}
        </button>
      </form>
    </div>
  );
};

export default Billing;