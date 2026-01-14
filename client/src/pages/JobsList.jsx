import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    fetchJobs();
    // Giriş yapan kullanıcının ID'sini al
    const uid = localStorage.getItem('userUid');
    setCurrentUserId(uid);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:3000/jobs');
      setJobs(response.data);
    } catch (err) {
      console.error('İşler yüklenemedi');
    }
  };

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.category === filter);

  return (
    <div style={styles.container}>
      <h2>Mevcut İş İlanları</h2>
      
      <div style={styles.filterBar}>
        <button onClick={() => setFilter('all')} style={styles.filterButton}>Tümü</button>
        <button onClick={() => setFilter('tech')} style={styles.filterButton}>Teknoloji</button>
        <button onClick={() => setFilter('cleaning')} style={styles.filterButton}>Temizlik</button>
      </div>

      <div style={styles.jobGrid}>
        {filteredJobs.map(job => {
          // Bu ilan şu anki kullanıcıya mı ait?
          const isOwner = currentUserId === job.employerId;

          return (
            <div key={job.id} style={{
              ...styles.jobCard, 
              borderColor: isOwner ? '#28a745' : '#ddd', // Kendi ilanıysa yeşil çerçeve
              background: isOwner ? '#f9fff9' : 'white'
            }}>
              {isOwner && (
                <div style={{
                  background: '#28a745', color: 'white', fontSize: '12px', 
                  padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '5px'
                }}>
                  Senin İlanın
                </div>
              )}
              
              <h4>{job.title}</h4>
              <p style={{fontSize: '14px', color: '#555'}}>{job.description.substring(0, 100)}...</p>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
                <span style={{fontWeight: 'bold', color: '#007bff'}}>{job.price} TL</span>
                <span style={{fontSize: '12px', background: '#eee', padding: '4px 8px', borderRadius: '10px'}}>
                  {job.location}
                </span>
              </div>

              <div style={styles.buttonGroup}>
                <Link to={`/job/${job.id}`} style={styles.detailLink}>
                  İlana Git
                </Link>

                {/* Eğer ilan sahibiyse Başvuranları Gör butonu çıksın */}
                {isOwner && (
                  <Link to={`/job/${job.id}/applicants`} style={styles.applicantLink}>
                    👥 Başvuranlar
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
  filterBar: { margin: '20px 0', display: 'flex', gap: '10px' },
  filterButton: { padding: '8px 15px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', background: 'white' },
  jobGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  jobCard: { border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: '0.3s' },
  buttonGroup: { display: 'flex', gap: '10px', marginTop: '15px' },
  detailLink: {
    flex: 1, textAlign: 'center', padding: '10px',
    backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px'
  },
  applicantLink: {
    flex: 1, textAlign: 'center', padding: '10px',
    backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px'
  }
};

export default JobsList;