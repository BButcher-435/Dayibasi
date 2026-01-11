// client/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Register from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      {/* Basit bir Navbar (Geçici) */}
      <nav style={{ padding: '20px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '15px' }}>Ana Sayfa</Link>
        <Link to="/registerPage">Kayıt Ol</Link>
      </nav>

      <Routes>
        <Route path="/" element={<div style={{textAlign:'center'}}><h1>Hoşgeldiniz!</h1></div>} />
        <Route path="/registerPage" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;