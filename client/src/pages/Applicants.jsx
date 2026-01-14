import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Applicants = () => {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await axios.get(`http://localhost:3000/jobs/${id}/applicants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplicants(response.data);
      } catch (err) {
        alert('Başvuranlar yüklenemedi. Yetkiniz olmayabilir.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [id]);

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{maxWidth: '800px', margin: '30px auto', padding: '20px'}}>
      <h2>Başvuranlar Listesi</h2>
      {applicants.length === 0 ? (
        <p>Henüz başvuru yok.</p>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          {applicants.map(app => (
            <div key={app.id} style={{background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h4>{app.workerName}</h4>
                <p style={{fontSize: '14px', color: '#666'}}>Başvuru Tarihi: {new Date(app.appliedAt).toLocaleDateString()}</p>
                <span style={{
                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                  background: app.status === 'pending' ? '#fff3cd' : '#d4edda'
                }}>
                  Durum: {app.status === 'pending' ? 'Bekliyor' : app.status}
                </span>
              </div>
              <button style={{padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                Onayla ve İşe Başlat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applicants;