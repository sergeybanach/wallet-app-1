import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import AuthForm from './AuthForm.tsx';
import Home from './Home.tsx';
import Profile from './Profile.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} /> {/* App will check auth state */}
        <Route path="/auth" element={<AuthForm />} /> {/* Login/Register */}
        <Route path="/home" element={<Home />} /> {/* Home page */}
        <Route path="/profile" element={<Profile />} /> {/* Profile editing */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);