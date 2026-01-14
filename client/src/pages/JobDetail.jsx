import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const { user } = useAuth(); // Context kullanımı

  useEffect(() => {
    fetchJob();
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
      fetchJob(); 
    } catch (err) {
      alert(err.response?.data?.error || 'Başvuru başarısız!');
    }
  };

  if (!job) return <div>Yükleniyor...</div>;

  const isOwner = user && user.uid === job.employerId;
  const isWorker = user && user.role === 'worker';

  return (
    <div className="detail-container">
      <h2>{job.title}</h2>
      <p style={{margin: '20px 0', lineHeight: '1.6'}}>{job.description}</p>
      
      <div className="detail-meta">
        <span>💰 {job.price} TL</span>
        <span>📍 {job.location}</span>
        <span>📅 {job.deadline || 'Belirtilmedi'}</span>
        <span>👥 <strong>{job.applicantCount || 0} Başvuru</strong></span>
      </div>

      <div className="detail-actions">
        {/* İşçi ise ve kendi ilanı değilse Başvur butonu */}
        {isWorker && !isOwner && (
          <button onClick={handleApply} className="action-btn btn-primary" style={{border: 'none', cursor: 'pointer'}}>
            Bu İşe Başvur
          </button>
        )}

        {/* İlan sahibiyse Başvuranları Gör butonu */}
        {isOwner && (
          <Link to={`/job/${id}/applicants`} className="action-btn" style={{backgroundColor: '#17a2b8'}}>
            Başvuranları Gör ({job.applicantCount || 0})
          </Link>
        )}
      </div>
    </div>
  );
};

export default JobDetail;