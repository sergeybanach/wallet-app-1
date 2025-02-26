import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import TopBar from './TopBar';

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [hasWallet, setHasWallet] = useState<boolean | null>(null); // null = loading, true/false = wallet status
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check Firestore for wallet data
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data()?.wallet) {
            setHasWallet(true);
          } else {
            setHasWallet(false);
          }
        } catch (err) {
          console.error('Error fetching wallet data:', err);
          setHasWallet(false); // Default to no wallet on error
        }
        setLoading(false);
      } else {
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (!user || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar user={user} />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to Your Wallet</h1>
        {hasWallet === true ? (
          <p className="text-gray-700">You have a TON wallet registered!</p>
        ) : (
          <p className="text-gray-700">No TON wallet found. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}

export default Home;