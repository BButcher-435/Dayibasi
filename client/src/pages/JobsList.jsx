import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const { user } = useAuth(); 

  const API_URL = 'http://localhost:3000'; 

  // Kategori Listesi (Create sayfasıyla aynı sırayla)
  const categories = [
    { value: 'all', label: '🔍 Tüm Kategoriler' },
    { value: 'general', label: '🛠️ Genel İş' },
    { value: 'tech', label: '💻 Yazılım & Teknoloji' },
    { value: 'cleaning', label: '🧹 Temizlik & Düzen' },
    { value: 'repair', label: '🔧 Tamir & Tadilat' },
    { value: 'construction', label: '🏗️ İnşaat & Boya' },
    { value: 'transport', label: '🚚 Nakliye & Taşıma' },
    { value: 'education', label: '📚 Özel Ders & Eğitim' },
    { value: 'design', label: '🎨 Tasarım & Yaratıcı' },
    { value: 'pet', label: '🐾 Evcil Hayvan Bakımı' },
    { value: 'garden', label: '🌱 Bahçe & Peyzaj' },
    { value: 'health', label: '🩺 Sağlık & Bakım' },
    { value: 'event', label: '🎉 Organizasyon & Etkinlik' },
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/jobs`);
      setJobs(response.data);
      setError(null);
    } catch (err) {
      console.error('Hata:', err);
      setError('İlanlar yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.category === filter);

  if (loading) return <div style={{textAlign: 'center', padding: '50px', fontSize: '18px'}}>🌀 İlanlar Yükleniyor...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>⚠️ {error}</div>;

  return (
    <div className="jobs-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px'}}>
        <h2 style={{margin: 0}}>Mevcut İş İlanları ({filteredJobs.length})</h2>
        
        {user?.role === 'employer' && (
          <Link to="/job/create" style={{
            background: '#007bff', color: 'white', textDecoration: 'none', 
            padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold'
          }}>
            + İlan Ver
          </Link>
        )}
      </div>
      
      {/* 🛠️ YENİ FİLTRELEME ALANI (Dropdown) */}
      <div className="filter-bar" style={{marginBottom: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <span style={{fontWeight: 'bold', color: '#555'}}>Kategori Filtrele:</span>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '10px', borderRadius: '6px', border: '1px solid #ccc', 
            flex: 1, maxWidth: '300px', cursor: 'pointer'
          }}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {filteredJobs.length === 0 ? (
        <div style={{textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '8px', border: '1px dashed #ccc'}}>
          🔍 Bu kategoride henüz ilan bulunmuyor.
        </div>
      ) : (
        <div className="job-grid">
          {filteredJobs.map(job => {
            const isOwner = user && (user.uid === job.employerId || user.id === job.employerId);
            // Kategorinin güzel ismini bulalım (etiket olarak göstermek için)
            const catLabel = categories.find(c => c.value === job.category)?.label || job.category;

            return (
              <div key={job.id} className={`job-card ${isOwner ? 'owner' : ''}`} style={{
                border: isOwner ? '2px solid #28a745' : '1px solid #ddd',
                padding: '20px', borderRadius: '10px', background: 'white', marginBottom: '15px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{fontSize: '12px', background: '#e9ecef', padding: '4px 10px', borderRadius: '15px', color: '#555'}}>
                    {catLabel}
                  </span>
                  {isOwner && (
                    <span style={{background: '#28a745', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '10px'}}>
                      ✨ Sizin İlanınız
                    </span>
                  )}
                </div>
                
                <h3 style={{margin: '10px 0', fontSize: '18px'}}>{job.title}</h3>
                <p style={{fontSize: '14px', color: '#666', lineHeight: '1.5', minHeight: '40px'}}>
                  {job.description ? job.description.substring(0, 100) + (job.description.length > 100 ? '...' : '') : 'Açıklama yok'}
                </p>
                
                <div className="job-meta" style={{display: 'flex', gap: '15px', fontSize: '14px', color: '#333', marginTop: '15px', fontWeight: 'bold'}}>
                  <span className="job-price" style={{color: '#28a745'}}>💰 {job.price} TL</span>
                  <span className="job-location">📍 {job.location}</span>
                </div>

                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                  {/* Job ID uyumluluğu için kontrol */}
                  <Link to={`/job/${job.id}`} style={{
                    flex: 1, textAlign: 'center', padding: '10px', background: '#007bff', 
                    color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold'
                  }}>
                    Detaylar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobsList;