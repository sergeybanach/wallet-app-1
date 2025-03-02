// src/ton-config.ts
export const TON_CONFIG = {
    testnet: {
      endpoint: import.meta.env.VITE_TON_TESTNET_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC',
      apiKey: import.meta.env.VITE_TON_TESTNET_API_KEY,
    },
    mainnet: {
      endpoint: import.meta.env.VITE_TON_MAINNET_ENDPOINT || 'https://toncenter.com/api/v2/jsonRPC',
      apiKey: import.meta.env.VITE_TON_MAINNET_API_KEY,
    },
  };
  
  export type Network = 'testnet' | 'mainnet';