import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Uygulama açıldığında localStorage'dan kullanıcıyı geri yükle
  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem('userToken');
      const uid = localStorage.getItem('userUid');
      const firstName = localStorage.getItem('userFirstName');
      const lastName = localStorage.getItem('userLastName');
      const role = localStorage.getItem('userRole');
      const email = localStorage.getItem('userEmail');

      if (token && uid) {
        setUser({
          token,
          uid,
          firstName,
          lastName,
          role,
          email,
          fullName: `${firstName} ${lastName}`
        });
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // Giriş Yapma Fonksiyonu
  const login = (userData) => {
    // Önce LocalStorage'a kaydet
    localStorage.setItem('userToken', userData.token);
    localStorage.setItem('userUid', userData.uid);
    localStorage.setItem('userFirstName', userData.firstName);
    localStorage.setItem('userLastName', userData.lastName);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userName', `${userData.firstName} ${userData.lastName}`);

    // Sonra State'i güncelle (Sayfa yenilemeye gerek kalmaz!)
    setUser({
      ...userData,
      fullName: `${userData.firstName} ${userData.lastName}`
    });
  };

  // Çıkış Yapma Fonksiyonu
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // Profil Güncelleme Fonksiyonu
  const updateProfile = (updatedData) => {
    // LocalStorage güncelle
    localStorage.setItem('userFirstName', updatedData.firstName);
    localStorage.setItem('userLastName', updatedData.lastName);
    localStorage.setItem('userEmail', updatedData.email);
    localStorage.setItem('userPhone', updatedData.phone);
    
    // State güncelle
    setUser(prev => ({
      ...prev,
      ...updatedData,
      fullName: `${updatedData.firstName} ${updatedData.lastName}`
    }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Kolay kullanım için hook
export const useAuth = () => useContext(AuthContext);