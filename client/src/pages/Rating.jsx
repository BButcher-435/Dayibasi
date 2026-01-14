import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Rating = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:3000/jobs/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (!response.ok) throw new Error('Değerlendirme gönderilemedi');
      
      alert('Değerlendirmeniz kaydedildi!');
      navigate('/dashboard');
    } catch (err) {
      alert('Değerlendirme gönderilemedi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>İşi Değerlendirin</h2>
      <p>İş #{id} için karşı tarafı değerlendirin.</p>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.ratingSection}>
          <h4>Puan:</h4>
          <div style={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  ...styles.starButton,
                  color: star <= rating ? '#ffc107' : '#ccc'
                }}
              >
                ★
              </button>
            ))}
          </div>
          <p style={styles.ratingText}>{rating} / 5 yıldız</p>
        </div>

        <textarea
          placeholder="Yorumunuz (isteğe bağlı)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          style={styles.textarea}
        />

        <button type="submit" disabled={loading} style={styles.submitButton}>
          {loading ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: '500px', margin: '50px auto', padding: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '25px' },
  ratingSection: { textAlign: 'center' },
  stars: { margin: '15px 0', fontSize: '40px' },
  starButton: {
    background: 'none',
    border: 'none',
    fontSize: '40px',
    cursor: 'pointer',
    padding: '0 5px'
  },
  ratingText: { fontSize: '18px', marginTop: '10px' },
  textarea: {
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px'
  },
  submitButton: {
    padding: '15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};

export default Rating;