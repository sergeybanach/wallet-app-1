// src/TransactionHistory.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import { useNetwork } from './NetworkContext';
import { TON_CONFIG } from './ton-config';
import { FiRefreshCw } from 'react-icons/fi';

interface Transaction {
  hash: string;
  time: number;
  amount: string;
  from: string;
  to: string;
  type: 'sent' | 'received';
}

interface WalletData {
  address: string;
  publicKey: string;
  privateKey: string;
}

function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { network } = useNetwork();

  useEffect(() => {
    const fetchWalletAndTransactions = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/auth');
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data()?.wallet) {
          const walletData = userDoc.data().wallet as WalletData;
          setWalletAddress(walletData.address);
          await fetchTransactions(walletData.address);
        } else {
          navigate('/home');
        }
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletAndTransactions();
  }, [navigate, network]);

  const fetchTransactions = async (address: string) => {
    try {
      const config = TON_CONFIG[network];
      const baseUrl = config.endpoint.replace('/jsonRPC', '');
      const url = `${baseUrl}/getTransactions`;
      console.log('Fetching transactions from:', { url, apiKey: config.apiKey, address });

      if (!config.apiKey) {
        throw new Error('API key is missing for the selected network');
      }

      const response = await axios.get(url, {
        params: {
          address,
          limit: 10,
        },
        headers: {
          'X-API-Key': config.apiKey,
        },
      });

      console.log('Raw transactions:', response.data);

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Failed to fetch transactions');
      }

      const txs = response.data.result;
      const formattedTxs: Transaction[] = txs.map((tx: any) => {
        console.log('Parsing transaction:', tx);

        // Determine amount and type based on value flow
        const inValue = Number(tx.in_msg?.value || '0');
        const outValue = tx.out_msgs && tx.out_msgs.length > 0 ? Number(tx.out_msgs[0].value || '0') : 0;
        let amountNano = 0;
        let type: 'sent' | 'received' = 'received';
        let from = tx.in_msg?.source || 'Unknown';
        let to = address;

        if (inValue > 0 && outValue === 0) {
          // Purely received
          amountNano = inValue;
          type = 'received';
          from = tx.in_msg.source || 'Unknown';
          to = address;
        } else if (outValue > 0 && inValue === 0) {
          // Purely sent
          amountNano = outValue;
          type = 'sent';
          from = address;
          to = tx.out_msgs[0]?.destination || 'Unknown';
        } else if (inValue > 0 && outValue > 0) {
          // Both in and out (e.g., forwarded), use the larger value
          amountNano = inValue > outValue ? inValue : outValue;
          type = inValue > outValue ? 'received' : 'sent';
          from = type === 'received' ? tx.in_msg.source || 'Unknown' : address;
          to = type === 'sent' ? tx.out_msgs[0]?.destination || 'Unknown' : address;
        } else {
          // No value movement (e.g., initialization), use fee as placeholder
          amountNano = Number(tx.fee || '0');
          type = 'sent'; // Treat as fee payment
          from = address;
          to = 'Network Fees';
        }

        const amountTon = (amountNano / 1e9).toFixed(4);
        const utime = tx.utime ? tx.utime * 1000 : Date.now();

        return {
          hash: tx.transaction_id?.hash || 'Unknown',
          time: utime,
          amount: amountTon,
          from,
          to,
          type,
        };
      });

      setTransactions(formattedTxs);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to load transaction history');
    }
  };

  const handleRefresh = () => {
    if (walletAddress) {
      setLoading(true);
      setError(null);
      fetchTransactions(walletAddress).finally(() => setLoading(false));
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading transactions...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-full text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          title="Refresh Transactions"
        >
            <FiRefreshCw size={20} />
       
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {transactions.length === 0 ? (
        <p className="text-gray-600 text-center">No transactions yet.</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map((tx) => (
            <li key={tx.hash} className="border-b pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">
                    {tx.type === 'sent' ? 'Sent' : 'Received'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.time).toLocaleString()}
                  </p>
                  <p className="text-xs font-mono truncate">
                    {tx.type === 'sent' ? tx.to : tx.from}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    tx.type === 'sent' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {tx.type === 'sent' ? '-' : '+'}{tx.amount} TON
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TransactionHistory;