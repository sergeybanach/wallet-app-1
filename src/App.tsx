import { useState, useEffect } from 'react';
import './App.css';
import { auth } from './firebase';
import { User } from 'firebase/auth';
import AuthForm from './AuthForm';
import Home from './Home';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // This will be called when login/register succeeds, triggering a re-render
    setUser(auth.currentUser);
  };

  return user ? <Home /> : <AuthForm onAuthSuccess={handleAuthSuccess} />;
}

export default App;