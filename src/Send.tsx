import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Buffer } from 'buffer';
import { TonClient, WalletContractV4, Address, toNano, internal } from '@ton/ton';
import { useNetwork } from './NetworkContext';
import { TON_CONFIG } from './ton-config';

interface WalletData {
  address: string;
  publicKey: string;
  privateKey: string;
}

function Send() {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
            setWallet(userDoc.data().wallet as WalletData);
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !recipient || !amount) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const client = new TonClient({
        endpoint: TON_CONFIG[network].endpoint,
        apiKey: TON_CONFIG[network].apiKey,
      });

      const keyPair = {
        publicKey: Buffer.from(wallet.publicKey, 'hex'),
        secretKey: Buffer.from(wallet.privateKey, 'hex'),
      };
      const walletContract = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
      });

      const walletInstance = client.open(walletContract);
      const seqno = await walletInstance.getSeqno();

      const transferMessage = internal({
        to: Address.parse(recipient),
        value: toNano(amount),
        bounce: false,
      });

      const transfer = walletContract.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [transferMessage],
      });

      await walletInstance.send(transfer);
      setSuccess('Transaction sent successfully!');
      setRecipient('');
      setAmount('');
    } catch (err: any) {
      console.error('Error sending transaction:', err);
      setError(err.message || 'Failed to send transaction.');
    } finally {
      setSending(false);
    }
  };

  if (loading || !user || !wallet) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Send TON ({network.toUpperCase()})</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              type="text"
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="UQ..."
              required
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (TON)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.20"
              required
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
        <button
          onClick={() => navigate('/home')}
          className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back to Wallet
        </button>
      </div>
    </div>
  );
}

export default Send;