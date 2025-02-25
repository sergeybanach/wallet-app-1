import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { User } from 'firebase/auth';
import TopBar from './TopBar';
import Profile from './Profile';

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'profile'>('home'); // Toggle between views

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar user={user} onProfileClick={() => setView('profile')} />
      {view === 'home' ? (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome to Your Wallet</h1>
          <p className="text-gray-700">
            This is your home screen. Add your wallet features here!
          </p>
        </div>
      ) : (
        <Profile />
      )}
    </div>
  );
}

export default Home;