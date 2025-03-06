// src/BalanceCard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiMoreHorizontal } from 'react-icons/fi';
import { Address } from '@ton/ton';

interface WalletData {
  address: string;
  publicKey: string;
  privateKey: string;
}

interface BalanceCardProps {
  wallet: WalletData;
  balance: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  network: 'testnet' | 'mainnet';
}

function BalanceCard({ wallet, balance, isRefreshing, onRefresh, network }: BalanceCardProps) {
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy address:', err);
    });
  };

  const getAddressFormats = (address: string) => {
    const addr = Address.parse(address);
    const isTestnet = network === 'testnet';
    return {
      raw: addr.toRawString(),
      bounceable: addr.toString({ bounceable: true, testOnly: isTestnet }),
      nonBounceable: addr.toString({ bounceable: false, testOnly: isTestnet }),
      testBounceable: addr.toString({ bounceable: true, testOnly: true }),
      testNonBounceable: addr.toString({ bounceable: false, testOnly: true }),
    };
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md space-y-6">
      <div className="flex items-center justify-center space-x-4">
        <p className="text-4xl font-bold text-gray-900">
          {balance === null ? 'Fetching...' : balance === 'Error' ? 'N/A' : `${balance} TON`}
        </p>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-full text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          title="Refresh Balance"
        >
          <FiRefreshCw size={20} />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-center space-x-4">
          <p
            className="text-lg font-bold text-gray-700 text-center font-mono break-all cursor-pointer hover:text-gray-900"
            onClick={handleCopyAddress}
            title="Click to copy"
          >
            {copied ? 'Copied!' : wallet.address}
          </p>
          <button
            onClick={() => setShowAddressPopup(true)}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            title="Show All Address Formats"
          >
            <FiMoreHorizontal size={20} />
          </button>
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/receive')}
          className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Receive
        </button>
        <button
          onClick={() => navigate('/send')}
          className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Send
        </button>
      </div>

      {showAddressPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">All Address Formats</h3>
            {(() => {
              const formats = getAddressFormats(wallet.address);
              return (
                <div className="text-sm font-mono text-gray-700 space-y-2">
                  <p><span className="font-semibold">Raw:</span> {formats.raw}</p>
                  <p><span className="font-semibold">Bounceable:</span> {formats.bounceable}</p>
                  <p><span className="font-semibold">Non-Bounceable:</span> {formats.nonBounceable}</p>
                  <p><span className="font-semibold">Testnet Bounceable:</span> {formats.testBounceable}</p>
                  <p><span className="font-semibold">Testnet Non-Bounceable:</span> {formats.testNonBounceable}</p>
                </div>
              );
            })()}
            <button
              onClick={() => setShowAddressPopup(false)}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BalanceCard;