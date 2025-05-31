
import { useState, useEffect, useCallback } from 'react';
import { useUmi } from '@/components/UmiProvider';
import { CandyMachineService, MintResult } from '@/services/candyMachineService';
import { useToast } from '@/hooks/use-toast';

export const useCandyMachine = () => {
  const { umi } = useUmi();
  const { toast } = useToast();
  const [candyMachineService, setCandyMachineService] = useState<CandyMachineService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [candyMachineInfo, setCandyMachineInfo] = useState<any>(null);

  // Initialize Candy Machine
  useEffect(() => {
    const initializeCandyMachine = async () => {
      if (!umi) return;
      
      try {
        setIsLoading(true);
        console.log('Initializing Candy Machine service...');
        
        const service = new CandyMachineService(umi);
        await service.initialize();
        
        setCandyMachineService(service);
        setCandyMachineInfo(service.getCandyMachineInfo());
        setIsInitialized(true);
        
        console.log('Candy Machine service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Candy Machine:', error);
        toast({
          title: "Initialization Error",
          description: "Failed to load Candy Machine data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeCandyMachine();
  }, [umi, toast]);

  const mint = useCallback(async (mintAmount: number = 1): Promise<MintResult> => {
    if (!candyMachineService) {
      throw new Error('Candy Machine not initialized');
    }

    setIsLoading(true);
    
    try {
      console.log(`Attempting to mint ${mintAmount} NFT(s)...`);
      const result = await candyMachineService.mint(mintAmount);
      
      if (result.success) {
        // Update candy machine info after successful mint
        setCandyMachineInfo(candyMachineService.getCandyMachineInfo());
        
        toast({
          title: "Mint Successful!",
          description: `Successfully minted ${mintAmount} NFT(s)`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Mint Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('Mint error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      
      toast({
        title: "Mint Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [candyMachineService, toast]);

  return {
    mint,
    isLoading,
    isInitialized,
    candyMachineInfo,
    candyMachineService
  };
};
