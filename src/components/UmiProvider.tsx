import React, { createContext, useContext, useMemo } from 'react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine'; // Updated import
import { useWallet } from '@solana/wallet-adapter-react';
import { RPC_ENDPOINT } from '@/utils/config';
import type { Umi } from '@metaplex-foundation/umi';

interface UmiContextType {
  umi: Umi | null;
}

const UmiContext = createContext<UmiContextType>({ umi: null });

export const useUmi = () => {
  const context = useContext(UmiContext);
  if (!context) {
    throw new Error('useUmi must be used within UmiProvider');
  }
  return context;
};

interface UmiProviderProps {
  children: React.ReactNode;
}

export const UmiProvider: React.FC<UmiProviderProps> = ({ children }) => {
  const wallet = useWallet();

  const umi = useMemo(() => {
    if (!wallet.publicKey || !wallet.connected) return null;

    try {
      const umiInstance = createUmi(RPC_ENDPOINT)
        .use(walletAdapterIdentity(wallet))
        .use(mplCandyMachine()); // Updated plugin

      console.log('UMI instance created successfully');
      console.log('Wallet connected:', wallet.publicKey.toString());

      return umiInstance;
    } catch (error) {
      console.error('Failed to create UMI instance:', error);
      return null;
    }
  }, [wallet.publicKey, wallet.connected, wallet]);

  return (
    <UmiContext.Provider value={{ umi }}>
      {children}
    </UmiContext.Provider>
  );
};

export default UmiProvider;