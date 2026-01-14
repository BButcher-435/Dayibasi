import React, { useState } from 'react';
import axios from 'axios';

const Billing = () => {
  const [balance, setBalance] = useState(1000); // Örnek bakiye
  const [amount, setAmount] = useState('');

  const handleAddBalance = async () => {
    if (!amount || amount <= 0) {
      alert('Geçerli bir miktar girin!');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      await axios.post('http://localhost:3000/account/deposit', 
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBalance(balance + parseFloat(amount));
      setAmount('');
      alert('Bakiye yüklendi!');
    } catch (err) {
      alert('Bakiye yüklenemedi!');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Bakiye Yönetimi</h2>
      
      <div style={styles.balanceCard}>
        <h3>Mevcut Bakiye</h3>
        <p style={styles.balanceAmount}>{balance} TL</p>
      </div>

      <div style={styles.addBalance}>
        <h3>Bakiye Yükle</h3>
        <div style={styles.inputGroup}>
          <input
            type="number"
            placeholder="Miktar (TL)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleAddBalance} style={styles.addButton}>
            Yükle
          </button>
        </div>
      </div>

      <div style={styles.transactions}>
        <h3>Son İşlemler</h3>
        <ul style={styles.transactionList}>
          <li>İş #123 - +500 TL (15.01.2024)</li>
          <li>İş #456 - -200 TL (14.01.2024)</li>
          <li>Bakiye Yükleme - +1000 TL (13.01.2024)</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '600px', margin: '30px auto', padding: '20px' },
  balanceCard: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    textAlign: 'center'
  },
  balanceAmount: { fontSize: '2em', fontWeight: 'bold', color: '#28a745' },
  addBalance: { marginBottom: '30px' },
  inputGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
  input: { flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  transactions: { marginTop: '30px' },
  transactionList: { listStyle: 'none', padding: 0 }
};

export default Billing;