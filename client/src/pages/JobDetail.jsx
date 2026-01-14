import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchJob();
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/jobs/${id}`);
      setJob(response.data);
    } catch (err) {
      console.error('İş detayı yüklenemedi');
    }
  };

  const handleApply = async () => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.post(`http://localhost:3000/jobs/${id}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Başvurunuz gönderildi!');
    } catch (err) {
      alert('Başvuru gönderilemedi!');
    }
  };

  if (!job) return <div>Yükleniyor...</div>;

  return (
    <div style={styles.container}>
      <h2>{job.title}</h2>
      <p style={styles.description}>{job.description}</p>
      <p><strong>Fiyat:</strong> {job.price} TL</p>
      <p><strong>Kategori:</strong> {job.category}</p>
      <p><strong>Durum:</strong> {job.status}</p>

      <div style={styles.actionButtons}>
        {userRole === 'worker' ? (
          <button onClick={handleApply} style={styles.applyButton}>
            Bu İşe Başvur
          </button>
        ) : (
          <Link to={`/job/${id}/applicants`} style={styles.viewButton}>
            Başvuranları Gör
          </Link>
        )}
        
        <Link to={`/job/${id}/dispute`} style={styles.disputeButton}>
          Sorun Bildir
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '30px auto', padding: '20px' },
  description: { margin: '20px 0', lineHeight: '1.6' },
  actionButtons: { marginTop: '30px', display: 'flex', gap: '15px' },
  applyButton: {
    padding: '12px 25px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  viewButton: {
    padding: '12px 25px',
    backgroundColor: '#17a2b8',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px'
  },
  disputeButton: {
    padding: '12px 25px',
    backgroundColor: '#dc3545',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px'
  }
};

export default JobDetail;