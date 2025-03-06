// src/Home.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV4, TonClient, Address } from '@ton/ton';
import { Buffer } from 'buffer';
import TopBar from './TopBar';
import { useNetwork } from './NetworkContext';
import { TON_CONFIG } from './ton-config';
import TransactionHistory from './TransactionHistory';
import BalanceCard from './BalanceCard'; // Import the new component

interface WalletData {
  address: string;
  publicKey: string;
  privateKey: string;
}

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [mnemonic, setMnemonic] = useState<string[] | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { network } = useNetwork();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data()?.wallet) {
            setHasWallet(true);
            const walletData = userDoc.data().wallet as WalletData;
            setWallet(walletData);
            await fetchBalance(walletData.address);
          } else {
            setHasWallet(false);
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
  }, [navigate, network]);

  const generateAndSaveWallet = async (userId: string) => {
    try {
      const mnemonicWords = await mnemonicNew();
      setMnemonic(mnemonicWords);

      const keyPair = await mnemonicToPrivateKey(mnemonicWords);
      const walletContract = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
      });

      const walletData: WalletData = {
        publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
        privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
        address: walletContract.address.toString({ bounceable: false, testOnly: network === 'testnet' }),
      };

      await setDoc(doc(db, 'users', userId), { wallet: walletData });
      setHasWallet(true);
      setWallet(walletData);
      await fetchBalance(walletData.address);
    } catch (err) {
      console.error('Error generating wallet:', err);
      setHasWallet(false);
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      setIsRefreshing(true);
      const client = new TonClient({
        endpoint: TON_CONFIG[network].endpoint,
        apiKey: TON_CONFIG[network].apiKey,
      });
      const walletAddress = Address.parse(address);
      const balanceNano = await client.getBalance(walletAddress);
      const balanceTon = Number(balanceNano) / 1e9;
      setBalance(balanceTon.toFixed(2));
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance('Error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshBalance = () => {
    if (wallet) {
      setBalance(null);
      fetchBalance(wallet.address);
    }
  };

  if (!user || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar user={user} />
      <div className="p-6 space-y-6">
        {hasWallet === true && mnemonic ? (
          <div className="space-y-4">
            <p className="text-gray-700">Your TON wallet has been created! Save this mnemonic phrase securely (it will only be shown once):</p>
            <div className="bg-gray-200 p-4 rounded-md">
              <p className="text-sm font-mono break-words">{mnemonic.join(' ')}</p>
            </div>
            <button
              onClick={() => setMnemonic(null)}
              className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              I’ve Saved It
            </button>
          </div>
        ) : hasWallet === true && wallet ? (
          <>
            <div className="space-y-4">
              <BalanceCard
                wallet={wallet}
                balance={balance}
                isRefreshing={isRefreshing}
                onRefresh={handleRefreshBalance}
                network={network}
              />
            </div>
            <TransactionHistory />
          </>
        ) : (
          <p className="text-gray-700">Generating your TON wallet...</p>
        )}
      </div>
    </div>
  );
}

export default Home;