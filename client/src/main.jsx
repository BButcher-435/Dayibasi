import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'; // <-- Yeni ekledik

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Uygulamayı AuthProvider ile sarıyoruz */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)