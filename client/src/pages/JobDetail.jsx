import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    fetchJob();
    const role = localStorage.getItem('userRole');
    const uid = localStorage.getItem('userUid'); // Kullanıcı ID'sini de alıyoruz
    setUserRole(role);
    setCurrentUserId(uid);
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
      fetchJob(); // Başvuru sayısını güncellemek için sayfayı yenile
    } catch (err) {
      alert(err.response?.data?.error || 'Başvuru başarısız!');
    }
  };

  if (!job) return <div>Yükleniyor...</div>;

  // İlanın sahibi bu kullanıcı mı?
  const isOwner = currentUserId === job.employerId;

  return (
    <div style={styles.container}>
      <h2>{job.title}</h2>
      <p style={styles.description}>{job.description}</p>
      
      <div style={{display: 'flex', gap: '20px', marginBottom: '20px', color: '#666'}}>
        <span>💰 {job.price} TL</span>
        <span>📍 {job.location}</span>
        <span>📅 {job.deadline}</span>
        <span>👥 <strong>{job.applicantCount || 0} Başvuru</strong></span>
      </div>

      <div style={styles.actionButtons}>
        {/* İşçi ise ve kendi ilanı değilse Başvur butonu */}
        {userRole === 'worker' && (
          <button onClick={handleApply} style={styles.applyButton}>
            Bu İşe Başvur
          </button>
        )}

        {/* İlan sahibiyse Başvuranları Gör butonu */}
        {isOwner && (
          <Link to={`/job/${id}/applicants`} style={styles.viewButton}>
            Başvuranları Gör ({job.applicantCount || 0})
          </Link>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '30px auto', padding: '20px', background: 'white', borderRadius: '8px' },
  description: { margin: '20px 0', lineHeight: '1.6' },
  actionButtons: { marginTop: '30px', display: 'flex', gap: '15px' },
  applyButton: { padding: '12px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  viewButton: { padding: '12px 25px', backgroundColor: '#17a2b8', color: 'white', textDecoration: 'none', borderRadius: '4px' }
};

export default JobDetail;