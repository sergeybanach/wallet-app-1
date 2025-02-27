import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import AuthForm from './AuthForm.tsx';
import Home from './Home.tsx';
import Profile from './Profile.tsx';
import Receive from './Receive.tsx';
import Send from './Send.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/send" element={<Send />} /> {/* New route */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);