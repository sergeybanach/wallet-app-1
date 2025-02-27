import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react'; // Use QRCodeCanvas instead of QRCode

interface WalletData {
  address: string;
  publicKey: string;
  privateKey: string;
}

function Receive() {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data()?.wallet) {
            const walletData = userDoc.data().wallet as WalletData;
            setWalletAddress(walletData.address);
          } else {
            navigate('/home');
          }
        } catch (err) {
          console.error('Error fetching wallet data:', err);
          navigate('/home');
        }
        setLoading(false);
      } else {
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading || !user || !walletAddress) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Receive TON</h2>
        <p className="text-gray-700 text-center">
          Share this address or scan the QR code to receive TON:
        </p>
        <div className="flex justify-center">
          <QRCodeCanvas value={walletAddress} size={200} />
        </div>
        <p className="text-sm font-mono text-gray-700 break-all text-center">{walletAddress}</p>
        <button
          onClick={() => navigate('/home')}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Back to Wallet
        </button>
      </div>
    </div>
  );
}

export default Receive;