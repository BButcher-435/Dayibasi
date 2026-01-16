import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Profil bilgisini çek
        const userRes = await axios.get(`http://localhost:3000/auth/user/${id}`);
        setProfileUser(userRes.data);

        // Yorumları çek
        try {
          const reviewRes = await axios.get(`http://localhost:3000/jobs/reviews/${id}`);
          setReviews(reviewRes.data.reviews || []);
        } catch (e) {
          console.log("Yorum yok.");
        }

      } catch (err) {
        console.error("Hata:", err);
        setError("Kullanıcı bulunamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;
  if (error) return <div style={{textAlign:'center', marginTop:'50px', color:'red'}}>{error}</div>;
  if (!profileUser) return null;

  const isOwnProfile = currentUser && (currentUser.uid === profileUser.uid || currentUser.id === profileUser.uid);

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      
      {/* PROFİL KARTI */}
      <div style={{ background: 'white', borderRadius: '10px', padding: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* AVATAR */}
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%', background: '#007bff', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold'
        }}>
          {profileUser.firstName?.charAt(0).toUpperCase()}
        </div>

        {/* BİLGİLER */}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>
            {profileUser.firstName} {profileUser.lastName}
          </h1>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
            <span style={{ 
              background: profileUser.role === 'employer' ? '#e3f2fd' : '#d4edda', 
              color: profileUser.role === 'employer' ? '#007bff' : '#28a745', 
              padding: '5px 12px', borderRadius: '15px', fontWeight: 'bold', fontSize: '14px' 
            }}>
              {profileUser.role === 'employer' ? '👔 İşveren' : '👷 İşçi'}
            </span>
          </div>

          {/* İLETİŞİM BİLGİLERİ KUTUSU */}
          <div style={{display:'flex', flexDirection:'column', gap:'5px', color:'#666', fontSize:'14px', marginBottom:'15px'}}>
            
            {/* E-posta */}
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <span>📧</span> {profileUser.email}
            </div>

            {/* 🔥 YENİ EKLENEN: TELEFON (Varsa Göster) */}
            {profileUser.phone && (
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <span>📞</span> {profileUser.phone}
                </div>
            )}
            
          </div>

          {/* BİYOGRAFİ */}
          {profileUser.bio && (
            <div style={{background:'#f9f9f9', padding:'10px', borderRadius:'6px', fontStyle:'italic', color:'#555', marginBottom:'15px'}}>
                "{profileUser.bio}"
            </div>
          )}

          {/* BUTONLAR (SADECE KENDİ PROFİLİMSE) */}
          {isOwnProfile && (
            <div style={{ marginTop: '15px', borderTop:'1px solid #eee', paddingTop:'15px', display:'flex', gap:'15px' }}>
               <Link to="/account/billing" style={{ textDecoration: 'none', color: '#28a745', fontWeight: 'bold' }}>
                 💰 Bakiye: {profileUser.balance || 0} TL
               </Link>
               <Link to="/profile" style={{ textDecoration: 'none', color: '#6c757d', fontWeight: 'bold' }}>
                 ⚙️ Profili Düzenle
               </Link>
            </div>
          )}
        </div>
      </div>

      {/* YORUMLAR */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
          Değerlendirmeler ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>Henüz değerlendirme yapılmamış.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {reviews.map((rev, index) => (
              <div key={rev.id || index} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold', color: '#333' }}>{rev.reviewerName}</span>
                  <span style={{ color: '#ffc107', fontWeight: 'bold' }}>{'★'.repeat(rev.score)}</span>
                </div>
                <p style={{ margin: 0, color: '#555' }}>{rev.comment}</p>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default UserProfile;