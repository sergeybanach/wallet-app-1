import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { User } from 'firebase/auth';
import TopBar from './TopBar';

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/auth'); // Redirect to auth if not logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar user={user} />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to Your Wallet</h1>
        <p className="text-gray-700">
          This is your home screen. Add your wallet features here!
        </p>
      </div>
    </div>
  );
}

export default Home;