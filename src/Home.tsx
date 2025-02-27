import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';
import TopBar from './TopBar';
import { Buffer } from 'buffer';

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [mnemonic, setMnemonic] = useState<string[] | null>(null); // Store mnemonic temporarily
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
            setHasWallet(true);
          } else {
            setHasWallet(false);
            // Generate new wallet if none exists
            await generateAndSaveWallet(currentUser.uid);
          }
        } catch (err) {
          console.error('Error fetching wallet data:', err);
          setHasWallet(false);
        }
        setLoading(false);
      } else {
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const generateAndSaveWallet = async (userId: string) => {
    try {
      // Generate mnemonic locally
      const mnemonicWords = await mnemonicNew(); // 24-word mnemonic
      setMnemonic(mnemonicWords); // Show to user

      // Derive key pair from mnemonic
      const keyPair = await mnemonicToPrivateKey(mnemonicWords);

      // Create TON wallet (v4 is the latest standard as of now)
      const wallet = WalletContractV4.create({
        workchain: 0, // Mainnet workchain
        publicKey: keyPair.publicKey,
      });

      // Save only public and private keys to Firestore
      const walletData = {
        publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
        privateKey: Buffer.from(keyPair.secretKey).toString('hex'), // Note: Storing private key; encrypt in production!
        address: wallet.address.toString(), // TON address
      };

      await setDoc(doc(db, 'users', userId), { wallet: walletData });
      setHasWallet(true);
    } catch (err) {
      console.error('Error generating wallet:', err);
      setHasWallet(false);
    }
  };

  if (!user || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar user={user} />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to Your Wallet</h1>
        {hasWallet === true && mnemonic ? (
          <div className="space-y-4">
            <p className="text-gray-700">Your TON wallet has been created! Save this mnemonic phrase securely (it will only be shown once):</p>
            <div className="bg-gray-200 p-4 rounded-md">
              <p className="text-sm font-mono break-words">{mnemonic.join(' ')}</p>
            </div>
            <button
              onClick={() => setMnemonic(null)} // Hide mnemonic after user acknowledges
              className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              I’ve Saved It
            </button>
          </div>
        ) : hasWallet === true ? (
          <p className="text-gray-700">You have a TON wallet registered!</p>
        ) : (
          <p className="text-gray-700">Generating your TON wallet...</p>
        )}
      </div>
    </div>
  );
}

export default Home;