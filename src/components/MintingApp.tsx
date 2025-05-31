import React, { createContext, useContext, useMemo } from 'react';
import { useState } from "react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useCandyMachine } from "@/hooks/useCandyMachine";
import NFTDisplay from "@/components/mint/NFTDisplay";
import MintForm from "@/components/mint/MintForm";
import SuccessModal from "@/components/mint/SuccessModal";
import WalletStatus from "@/components/mint/WalletStatus";

export const MintingApp = () => {
  const { wallet, blinkyBalance, fetchUserBlinkyBalance } = useWalletBalance();
  const { mint, isLoading, isInitialized, candyMachineInfo } = useCandyMachine();
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mintedNftName, setMintedNftName] = useState("");

  // Handle actual minting with Candy Machine
  const handleMint = async (mintAmount: number) => {
    if (!wallet.connected || isLoading || !isInitialized) return;
    
    setStatus('Processing transaction...');
    
    try {
      const result = await mint(mintAmount);
      
      if (result.success) {
        setMintedNftName(result.nft?.name || "Blinky OG VIP NFT");
        setStatus('✅ Minted successfully!');
        setIsModalOpen(true);
        
        // Update balance after minting
        await fetchUserBlinkyBalance();
      } else {
        setStatus(`❌ Mint failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Mint error:', err);
      setStatus('❌ Mint failed');
    }
  };

  // Show loading state while initializing
  if (wallet.connected && !isInitialized && isLoading) {
    return (
      <div className="min-h-screen bg-blinky-dark flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-blinky-darkblue rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 text-center">
            <h1 className="text-3xl font-bold text-green-400 mb-6">
              Blinky OG VIP Mint
            </h1>
            <div className="text-green-400">
              Loading Candy Machine data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blinky-dark flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-blinky-darkblue rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <h1 className="text-3xl font-bold text-center text-green-400 mb-6">
            Blinky OG VIP Mint
          </h1>
          
          {/* NFT Image */}
          <NFTDisplay 
            imageUrl="https://blinkyonsol.com/wp-content/uploads/2025/04/Blinky-OG-VIP-4K-1.png"
                      />
          
          {/* Wallet Connect Button */}
          <WalletStatus connected={wallet.connected} />
          
          {/* Main Content - Conditional based on wallet connection */}
          {wallet.connected && isInitialized && (
            <MintForm
              blinkyBalance={blinkyBalance}
              onMint={handleMint}
              status={status}
              itemsRedeemed={candyMachineInfo?.itemsRedeemed?.toString() || '0'}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
      
      {/* Company Logo */}
      <div className="mt-8 mb-4">
        <img
          src="https://blinkyonsol.com/wp-content/uploads/2025/02/Blinky_T_S_Smile_2_.png"
          alt="Blinky Logo"
          className="h-16 w-auto mx-auto"
        />
      </div>
      
      {/* Success Modal */}
      <SuccessModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        nftName={mintedNftName} 
      />
    </div>
  );
};

export default MintingApp;
