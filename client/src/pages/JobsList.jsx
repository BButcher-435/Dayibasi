import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth(); // Context'ten user'ı al (daha güvenli)

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
    <div className="jobs-container">
      <h2>Mevcut İş İlanları</h2>
      
      <div className="filter-bar">
        <button onClick={() => setFilter('all')} className="filter-btn">Tümü</button>
        <button onClick={() => setFilter('tech')} className="filter-btn">Teknoloji</button>
        <button onClick={() => setFilter('cleaning')} className="filter-btn">Temizlik</button>
      </div>

      <div className="job-grid">
        {filteredJobs.map(job => {
          // Bu ilan şu anki kullanıcıya mı ait?
          // Not: user objesi null olabilir (giriş yapılmamışsa), kontrol ekledik.
          const isOwner = user && user.uid === job.employerId;

          return (
            <div key={job.id} className={`job-card ${isOwner ? 'owner' : ''}`}>
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
              
              <div className="job-meta">
                <span className="job-price">{job.price} TL</span>
                <span className="job-location">{job.location}</span>
              </div>

              <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                <Link to={`/job/${job.id}`} className="action-btn btn-primary" style={{flex: 1, textAlign: 'center', fontSize: '14px'}}>
                  İlana Git
                </Link>

                {isOwner && (
                  <Link to={`/job/${job.id}/applicants`} className="action-btn btn-secondary" style={{flex: 1, textAlign: 'center', fontSize: '14px'}}>
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

export default JobsList;