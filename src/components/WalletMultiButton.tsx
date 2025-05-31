import React from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export const WalletMultiButton = () => {
  const { wallet, disconnect, connecting, connected, publicKey, select, wallets } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Handle hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Format public key for display
  const formatPublicKey = (pubkey?: string) => {
    if (!pubkey) return '';
    return pubkey.slice(0, 4) + '...' + pubkey.slice(-4);
  };

  const handleConnect = (walletName: string) => {
    const selectedWallet = wallets.find(w => w.adapter.name === walletName);
    if (selectedWallet) {
      select(selectedWallet.adapter.name);
      setShowDropdown(false);
    }
  };

  if (connected && publicKey) {
    return (
      <Button
        variant="outline" 
        className="bg-indigo-700 text-white hover:bg-indigo-600"
        onClick={disconnect}
      >
        {formatPublicKey(publicKey.toString())} • Disconnect
      </Button>
    );
  }

  return (
    <div className="relative">
      {connecting ? (
        <Button disabled className="bg-indigo-700 text-white">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
        </Button>
      ) : (
        <>
          <Button 
            className="bg-indigo-700 text-white hover:bg-indigo-600" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Select Wallet
          </Button>
          
          {showDropdown && (
            <div className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg">
              <div className="py-1">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.adapter.name}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleConnect(wallet.adapter.name)}
                  >
                    {wallet.adapter.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WalletMultiButton;
