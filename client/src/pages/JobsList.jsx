import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
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
        <button onClick={() => setFilter('all')} style={styles.filterButton}>
          Tümü
        </button>
        <button onClick={() => setFilter('tech')} style={styles.filterButton}>
          Teknoloji
        </button>
        <button onClick={() => setFilter('cleaning')} style={styles.filterButton}>
          Temizlik
        </button>
      </div>

      <div style={styles.jobGrid}>
        {filteredJobs.map(job => (
          <div key={job.id} style={styles.jobCard}>
            <h4>{job.title}</h4>
            <p>{job.description.substring(0, 100)}...</p>
            <p><strong>Fiyat:</strong> {job.price} TL</p>
            <Link to={`/job/${job.id}`} style={styles.detailLink}>
              İlana Git
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
  filterBar: { margin: '20px 0', display: 'flex', gap: '10px' },
  filterButton: { padding: '8px 15px', border: '1px solid #ccc', borderRadius: '4px' },
  jobGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  jobCard: { border: '1px solid #ddd', padding: '15px', borderRadius: '5px' },
  detailLink: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px'
  }
};

export default JobsList;