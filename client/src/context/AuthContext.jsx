import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. UYGULAMA AÇILINCA KULLANICIYI HATIRLA ---
  useEffect(() => {
    const checkUser = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // JSON formatındaki veriyi tekrar objeye çeviriyoruz
          const parsedUser = JSON.parse(storedUser);
          
          // Token'ı da objeye ekleyip state'e atıyoruz
          setUser({ ...parsedUser, token: storedToken });
        }
      } catch (error) {
        // Eğer veri bozulmuşsa temizle
        console.error("Oturum kurtarma hatası:", error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // --- 2. GİRİŞ YAPMA (LOGIN) ---
  const login = (userData) => {
    // userData şunun gibi geliyor: { uid: '...', firstName: '...', token: '...', balance: 500 ... }
    
    // 1. Token ve Diğer Bilgileri Ayıralım
    const { token, ...restOfUser } = userData;

    // 2. LocalStorage'a Kaydet (Tek parça halinde!)
    localStorage.setItem('token', token); 
    localStorage.setItem('user', JSON.stringify(restOfUser)); // Nesneyi string'e çevirip sakla

    // 3. State'i Güncelle
    setUser(userData);
  };

  // --- 3. ÇIKIŞ YAPMA (LOGOUT) ---
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Eski parça parça kalanlar varsa onları da temizleyelim (Garanti olsun)
    localStorage.removeItem('userToken');
    localStorage.removeItem('userUid');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    
    setUser(null);
  };

  // --- 4. PROFİL GÜNCELLEME ---
  const updateProfile = (updatedData) => {
    // Mevcut kullanıcı verisiyle yeni gelen veriyi birleştir
    // (Örn: Sadece isim değiştiyse, bakiye eski haliyle kalsın)
    const newUserState = { ...user, ...updatedData };

    // State'i güncelle
    setUser(newUserState);

    // LocalStorage'ı güncelle (Token hariç)
    const { token, ...userToStore } = newUserState;
    localStorage.setItem('user', JSON.stringify(userToStore));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => useContext(AuthContext);