import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Applicants = () => {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Giriş yapmalısınız.");

        const response = await axios.get(`http://localhost:3000/jobs/${id}/applicants`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;
        
        // --- 🔍 DEBUG İÇİN KONSOLA YAZDIRMA ---
        console.log("GELEN BAŞVURU VERİSİ:", data);
        // ---------------------------------------

        if (data.applicants) {
            setApplicants(data.applicants);
        } else if (Array.isArray(data)) {
            setApplicants(data);
        } else {
            setApplicants([]); 
        }

        if (data.jobTitle) setJobTitle(data.jobTitle);

      } catch (err) {
        console.error(err);
        setError("Başvurular yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id]);

  const handleStatusChange = async (applicantId, status) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:3000/jobs/${id}/applicants/${applicantId}`, 
            { status }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(`Başvuru durumu güncellendi: ${status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}`);
        
        setApplicants(prev => prev.map(app => 
            (app.userId === applicantId || app.id === applicantId) ? { ...app, status } : app
        ));

    } catch (err) {
        console.error(err);
        alert("İşlem sırasında hata oluştu.");
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      
      <div style={{borderBottom:'1px solid #eee', paddingBottom:'15px', marginBottom:'20px'}}>
        <h2 style={{margin:0, color:'#333'}}>Başvuranlar</h2>
        {jobTitle && <p style={{color:'#666', margin:'5px 0 0 0'}}>İlan: <strong>{jobTitle}</strong></p>}
      </div>

      {error && <div style={{color:'red', marginBottom:'15px'}}>{error}</div>}

      {applicants.length === 0 ? (
        <div style={{textAlign:'center', padding:'40px', color:'#888', background:'#f9f9f9', borderRadius:'8px'}}>
          <h3 style={{color:'#ccc'}}>📭</h3>
          <p>Henüz bu ilana başvuru yapılmamış.</p>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
          {applicants.map((app, index) => {
            // 🔥 AKILLI İSİM YAKALAMA (Fallback Logic) 🔥
            // Backend hangi ismi gönderiyorsa onu yakala
            const firstName = app.userFirstName || app.firstName || app.name || 'İsimsiz';
            const lastName = app.userLastName || app.lastName || '';
            const email = app.userEmail || app.email || 'E-posta yok';
            const userId = app.userId || app.id;
            const appDate = app.appliedAt || app.date || app.createdAt;

            return (
              <div key={index} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center', 
                  padding:'15px', border:'1px solid #eee', borderRadius:'8px', background:'#fff'
              }}>
                {/* SOL TARAF */}
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                  {/* Avatar (Baş harf) */}
                  <div style={{
                    width:'40px', height:'40px', borderRadius:'50%', background:'#6f42c1', color:'white',
                    display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'18px'
                  }}>
                    {firstName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div style={{fontWeight:'bold', fontSize:'18px', color:'#007bff'}}>
                        <Link to={`/profile/${userId}`} style={{textDecoration:'none', color:'inherit'}}>
                            {firstName} {lastName}
                        </Link>
                    </div>
                    <div style={{fontSize:'14px', color:'#666', marginTop:'4px'}}>
                        📧 {email}
                    </div>
                    <div style={{fontSize:'12px', color:'#999', marginTop:'4px'}}>
                        📅 Başvuru Tarihi: {appDate ? new Date(appDate).toLocaleDateString() : 'Tarih yok'}
                    </div>
                  </div>
                </div>

                {/* SAĞ TARAF: BUTONLAR */}
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  {app.status === 'pending' ? (
                      <>
                          <button 
                              onClick={() => handleStatusChange(userId, 'rejected')}
                              style={{padding:'8px 15px', background:'#dc3545', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}
                          >
                              Reddet
                          </button>
                          <button 
                              onClick={() => handleStatusChange(userId, 'accepted')}
                              style={{padding:'8px 15px', background:'#28a745', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}
                          >
                              İşe Al
                          </button>
                      </>
                  ) : (
                      <span style={{
                          padding:'6px 12px', borderRadius:'15px', fontSize:'14px', fontWeight:'bold',
                          background: app.status === 'accepted' ? '#d4edda' : '#f8d7da',
                          color: app.status === 'accepted' ? '#155724' : '#721c24'
                      }}>
                          {app.status === 'accepted' ? '✅ İşe Alındı' : '❌ Reddedildi'}
                      </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applicants;