
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOKEN_AMOUNT } from '@/utils/config';
import { useToast } from "@/hooks/use-toast";

interface MintFormProps {
  blinkyBalance: number | null;
  onMint: (amount: number) => Promise<void>;
  status: string;
  itemsRedeemed: string;
  isLoading: boolean;
}

export const MintForm: React.FC<MintFormProps> = ({ 
  blinkyBalance, 
  onMint, 
  status, 
  itemsRedeemed,
  isLoading 
}) => {
  const [mintAmount, setMintAmount] = useState(1);
  
  const handleMintClick = () => {
    onMint(mintAmount);
  };

  return (
    <div className="space-y-6">
      {/* Balance display */}
      {blinkyBalance !== null && (
        <div className="text-center text-green-400 font-medium">
          Your BLINKY Balance: {blinkyBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
      )}
      
      {/* Mint amount selector */}
      <div className="flex items-center justify-between">
        <label className="text-green-400 font-medium">
          Mint Amount:
        </label>
        <Input
          type="number"
          min={1}
          max={10}
          value={mintAmount}
          onChange={(e) => setMintAmount(Number(e.target.value))}
          className="w-20 text-center bg-gray-800 border-gray-700 text-white"
        />
      </div>
      
      {/* Cost display */}
      <div className="text-center text-green-400 text-sm">
        Cost per mint: {Number(TOKEN_AMOUNT) / 1_000_000} BLINKY
      </div>
      
      {/* Mint confirmation info */}
      <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          Each NFT requires individual wallet confirmation. Confirmations appear sequentially - if you don't see the next prompt, check your wallet notifications.
        </p>
      </div>
      
      {/* Mint button */}
      <Button
        onClick={handleMintClick}
        disabled={isLoading}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md font-medium"
      >
        {isLoading ? 'Processing...' : `Mint ${mintAmount} NFT${mintAmount > 1 ? 's' : ''}`}
      </Button>
      
      {/* Instructions */}
      <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
        <p className="text-sm text-green-400">
          Select the number of NFTs to mint (1-10) and click "Mint" to approve the transaction.
        </p>
      </div>
      
      {/* Status display */}
      <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
        <p className="text-sm text-green-400 font-medium">
          Status: <span className="font-normal">{status || 'Ready to mint'}</span>
        </p>
        <p className="text-sm text-green-400 font-medium">
          Items Redeemed: <span className="font-normal">{itemsRedeemed}</span>
        </p>
      </div>
    </div>
  );
};

export default MintForm;
