
import React from 'react';
import { WalletMultiButton } from "@/components/WalletMultiButton";

interface WalletStatusProps {
  connected: boolean;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ connected }) => {
  return (
    <>
      <div className="flex justify-center mb-6">
        <WalletMultiButton />
      </div>
      
      {!connected && (
        <div className="text-center text-green-400 py-4">
          Connect your wallet to mint.
        </div>
      )}
    </>
  );
};

export default WalletStatus;
