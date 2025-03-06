// src/NetworkContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Network } from './ton-config';

interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  // Initialize network from localStorage, defaulting to 'testnet' if not set
  const [network, setNetwork] = useState<Network>(() => {
    return (localStorage.getItem('network') as Network) || 'testnet';
  });

  // Update localStorage whenever the network changes
  useEffect(() => {
    localStorage.setItem('network', network);
  }, [network]);

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}