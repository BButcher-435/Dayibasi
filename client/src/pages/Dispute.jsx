import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dispute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Lütfen bir açıklama girin!');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      await axios.post(`http://localhost:3000/jobs/${id}/dispute`, 
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Şikayetiniz gönderildi. Yönetici inceleyecektir.');
      navigate(`/job/${id}`);
    } catch (err) {
      alert('Şikayet gönderilemedi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Anlaşmazlık Bildirimi</h2>
      <p style={styles.warning}>
        ⚠️ Bu formu yalnızca ciddi sorunlar için kullanın.
      </p>
      
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Sorununuzu detaylıca açıklayın..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows="8"
          required
          style={styles.textarea}
        />
        
        <div style={styles.buttons}>
          <button
            type="button"
            onClick={() => navigate(`/job/${id}`)}
            style={styles.cancelButton}
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? 'Gönderiliyor...' : 'Şikayet Gönder'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: '700px', margin: '30px auto', padding: '20px' },
  warning: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    padding: '10px',
    borderRadius: '5px',
    margin: '20px 0'
  },
  textarea: {
    width: '100%',
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
    marginBottom: '20px'
  },
  buttons: { display: 'flex', gap: '15px', justifyContent: 'flex-end' },
  cancelButton: {
    padding: '12px 25px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '12px 25px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default Dispute;