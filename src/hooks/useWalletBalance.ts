
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";
import { useToast } from "@/hooks/use-toast";
import { RPC_ENDPOINT, TOKEN_MINT } from '@/utils/config';

export function useWalletBalance() {
  const wallet = useWallet();
  const { toast } = useToast();
  const [blinkyBalance, setBlinkyBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's BLINKY balance
  async function fetchUserBlinkyBalance() {
    if (!wallet.publicKey) return;
    
    try {
      const connection = new Connection(RPC_ENDPOINT, 'confirmed');
      const ata = getAssociatedTokenAddressSync(
        TOKEN_MINT,
        wallet.publicKey
      );
      
      try {
        const accountInfo = await getAccount(connection, ata);
        const rawBalance = accountInfo.amount;
        const floatBalance = Number(rawBalance) / 1_000_000;
        setBlinkyBalance(floatBalance);
        console.log('User BLINKY balance is', floatBalance);
      } catch (err) {
        console.warn('No BLINKY ATA or error:', err);
        setBlinkyBalance(0);
      }
    } catch (err) {
      setBlinkyBalance(0);
      toast({
        title: "Error fetching balance",
        description: "Could not load your BLINKY balance",
        variant: "destructive",
      });
    }
  }

  // When wallet connects, fetch data
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      fetchUserBlinkyBalance();
    }
  }, [wallet.connected, wallet.publicKey]);

  return {
    wallet,
    blinkyBalance,
    fetchUserBlinkyBalance,
    isLoading,
    setIsLoading
  };
}
