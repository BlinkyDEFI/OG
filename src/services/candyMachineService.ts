import { 
  fetchCandyMachine, 
  safeFetchCandyGuard,
  mintV2,
  CandyMachine,
  CandyGuard,
  DefaultGuardSetMintArgs
} from '@metaplex-foundation/mpl-candy-machine';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { 
  generateSigner,
  transactionBuilder,
  some,
  publicKey as umiPublicKey,
  unwrapOption,
  sol
} from '@metaplex-foundation/umi';
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { 
  CANDY_MACHINE_ID, 
  CANDY_GUARD_ID, 
  TOKEN_MINT, 
  TOKEN_AMOUNT,
  PAYMENT_DESTINATION_ATA
} from '@/utils/config';
import type { Umi } from '@metaplex-foundation/umi';
import bs58 from 'bs58';

export interface MintResult {
  success: boolean;
  signature?: string;
  nft?: any;
  error?: string;
}

export interface MultiMintResult {
  success: boolean;
  results: MintResult[];
  totalMinted: number;
  errors: string[];
}

export interface CandyMachineInfo {
  itemsAvailable: number;
  itemsRedeemed: number;
  itemsRemaining: number;
  price: number;
}

export class CandyMachineService {
  private umi: Umi;
  private candyMachine: CandyMachine | null = null;
  private candyGuard: CandyGuard | null = null;

  constructor(umi: Umi) {
    this.umi = umi;
  }

  async initialize(): Promise<void> {
    try {
      console.log('Fetching Candy Machine v3:', CANDY_MACHINE_ID.toString());
      this.candyMachine = await fetchCandyMachine(this.umi, umiPublicKey(CANDY_MACHINE_ID));
      
      console.log('Fetching Candy Guard:', CANDY_GUARD_ID.toString());
      this.candyGuard = await safeFetchCandyGuard(this.umi, umiPublicKey(CANDY_GUARD_ID));
      console.log(this.candyGuard.guards);
     
      console.log('Candy Machine v3 initialized successfully');
      console.log('Items loaded:', this.candyMachine.itemsLoaded);
      console.log('Items redeemed:', this.candyMachine.itemsRedeemed);
    } catch (error) {
      console.error('Failed to initialize Candy Machine v3:', error);
      throw error;
    }
  }

  async mintSingle(): Promise<MintResult> {
    return this.mintSingleNFT();
  }

  private async mintSingleNFT(): Promise<MintResult> {
    if (!this.candyMachine || !this.candyGuard) {
      throw new Error('Candy Machine v3 not initialized');
    }

    try {
      console.log('Starting single NFT mint process');
      
      // Check SOL balance before minting
      const balance = await this.umi.rpc.getBalance(this.umi.identity.publicKey);
      console.log('Current SOL balance:', balance.basisPoints.toString());
      
      // Ensure minimum SOL for transaction fees (0.01 SOL = 10,000,000 lamports)
      const minimumSolRequired = Number(sol(0.01).basisPoints);
      if (Number(balance.basisPoints) < minimumSolRequired) {
        throw new Error(`Insufficient SOL balance. Need at least 0.01 SOL for transaction fees. Current: ${Number(balance.basisPoints) / 1_000_000_000} SOL`);
      }
      
      // Build mint arguments for token payment
      let mintArgs: Partial<DefaultGuardSetMintArgs> = {};

      // Check if token payment guard is configured
      const tokenPayment = unwrapOption(this.candyGuard.guards.tokenPayment);
      if (tokenPayment) {
        console.log('Token payment guard found, adding mint args');
        console.log('Token mint:', TOKEN_MINT.toString());
        console.log('Payment destination ATA:', PAYMENT_DESTINATION_ATA.toString());
        
        mintArgs.tokenPayment = some({
          mint: umiPublicKey(TOKEN_MINT),
          destinationAta: umiPublicKey(PAYMENT_DESTINATION_ATA),
        });
      }

      // Check if mint limit guard is configured
      const mintLimit = unwrapOption(this.candyGuard.guards.mintLimit);
      if (mintLimit) {
        console.log('Mint limit guard found, adding mint args');
        mintArgs.mintLimit = some({ id: mintLimit.id });
      }

      // Generate a single NFT mint
      const nftMint = generateSigner(this.umi);
      console.log('Generating single NFT:', nftMint.publicKey.toString());

      // Build transaction with lower compute unit limit to reduce fees
      const builder = transactionBuilder()
        .add(setComputeUnitLimit(this.umi, { units: 400_000 }))
        .add(
          mintV2(this.umi, {
            candyMachine: this.candyMachine.publicKey,
            nftMint,
            collectionMint: this.candyMachine.collectionMint,
            collectionUpdateAuthority: this.candyMachine.authority,
            candyGuard: this.candyGuard.publicKey,
            mintArgs,
          })
        );

      console.log('Sending single NFT transaction for wallet approval...');
      
      // Focus window to bring wallet to front
      if (typeof window !== 'undefined') {
        window.focus();
      }
      
      // Send transaction with proper configuration
      const result = await builder.sendAndConfirm(this.umi, {
        confirm: { commitment: 'confirmed' },
        send: { 
          skipPreflight: true, // Skip preflight to reduce chances of timeout
          maxRetries: 1 // Reduce retries to prevent multiple popups
        }
      });

      // Convert signature properly
      let signatureString: string;
      if (typeof result.signature === 'string') {
        signatureString = result.signature;
      } else if (result.signature instanceof Uint8Array) {
        signatureString = bs58.encode(result.signature);
      } else {
        signatureString = 'unknown';
      }
      
      console.log('Single NFT mint successful! Signature:', signatureString);
      
      return {
        success: true,
        signature: signatureString,
        nft: {
          mint: nftMint.publicKey,
          name: 'Blinky OG VIP NFT'
        }
      };
      
    } catch (error: any) {
      console.error('Single NFT mint failed:', error);
      
      let errorMessage = 'Unknown minting error';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.toString) {
        errorMessage = error.toString();
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async mint(mintAmount: number = 1): Promise<MultiMintResult> {
    if (!this.candyMachine || !this.candyGuard) {
      throw new Error('Candy Machine v3 not initialized');
    }

    console.log(`Starting multi-mint process for ${mintAmount} NFTs`);
    
    const results: MintResult[] = [];
    const errors: string[] = [];
    let totalMinted = 0;

    // Check total SOL balance upfront
    const balance = await this.umi.rpc.getBalance(this.umi.identity.publicKey);
    const estimatedFeePerMint = Number(sol(0.01).basisPoints); // Estimate 0.01 SOL per mint
    const totalEstimatedFees = estimatedFeePerMint * mintAmount;
    
    console.log(`SOL balance: ${Number(balance.basisPoints) / 1_000_000_000} SOL`);
    console.log(`Estimated fees for ${mintAmount} mints: ${totalEstimatedFees / 1_000_000_000} SOL`);
    
    if (Number(balance.basisPoints) < totalEstimatedFees) {
      throw new Error(`Insufficient SOL for ${mintAmount} mints. Need approximately ${totalEstimatedFees / 1_000_000_000} SOL for fees. Current: ${Number(balance.basisPoints) / 1_000_000_000} SOL`);
    }

    for (let i = 0; i < mintAmount; i++) {
      try {
        console.log(`Preparing to mint NFT ${i + 1} of ${mintAmount}...`);
        
        // Focus window before each mint to ensure wallet popup appears on top
        if (typeof window !== 'undefined') {
          window.focus();
          console.log('Window focused for mint', i + 1);
        }
        
        // Wait a moment between mints to prevent wallet confusion
        if (i > 0) {
          console.log('Waiting 2 seconds before next mint...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        const mintResult = await this.mintSingleNFT();
        results.push(mintResult);
        
        if (mintResult.success) {
          totalMinted++;
          console.log(`Successfully minted NFT ${i + 1}/${mintAmount}. Signature: ${mintResult.signature}`);
        } else {
          errors.push(`Mint ${i + 1} failed: ${mintResult.error}`);
          console.error(`Failed to mint NFT ${i + 1}:`, mintResult.error);
          
          // If it's a SOL balance error, stop the process
          if (mintResult.error?.includes('Insufficient SOL') || mintResult.error?.includes('insufficient funds')) {
            console.log('Stopping multi-mint due to insufficient SOL');
            break;
          }
        }
        
      } catch (error: any) {
        const errorMessage = error.message || error.toString() || 'Unknown error';
        errors.push(`Mint ${i + 1} failed: ${errorMessage}`);
        results.push({
          success: false,
          error: errorMessage
        });
        console.error(`Error minting NFT ${i + 1}:`, error);
        
        // If it's a SOL balance error, stop the process
        if (errorMessage.includes('Insufficient SOL') || errorMessage.includes('insufficient funds')) {
          console.log('Stopping multi-mint due to insufficient SOL');
          break;
        }
      }
    }

    const overallSuccess = totalMinted > 0;
    
    console.log(`Multi-mint completed. Total minted: ${totalMinted}/${mintAmount}`);
    if (errors.length > 0) {
      console.log('Errors encountered:', errors);
    }

    return {
      success: overallSuccess,
      results,
      totalMinted,
      errors
    };
  }

  getCandyMachineInfo(): CandyMachineInfo | null {
    if (!this.candyMachine) return null;
    
    const itemsAvailable = Number(this.candyMachine.itemsLoaded);
    const itemsRedeemed = Number(this.candyMachine.itemsRedeemed);
    const itemsRemaining = itemsAvailable - itemsRedeemed;
    
    const price = Number(TOKEN_AMOUNT) / 1_000_000;
    
    return {
      itemsAvailable,
      itemsRedeemed,
      itemsRemaining,
      price,
    };
  }
}
