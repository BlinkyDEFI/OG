
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
  unwrapOption
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

  async mint(mintAmount: number = 1): Promise<MintResult> {
    if (!this.candyMachine || !this.candyGuard) {
      throw new Error('Candy Machine v3 not initialized');
    }

    try {
      console.log(`Starting mint process for ${mintAmount} NFT(s)`);
      
      // Calculate total cost for display
      const totalTokenAmount = Number(TOKEN_AMOUNT) * mintAmount;
      const costBlinky = totalTokenAmount / 1_000_000;
      console.log(`Total cost: ${costBlinky} BLINKY tokens`);

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

      // Build transaction with compute unit instructions
      let builder = transactionBuilder()
        .add(setComputeUnitLimit(this.umi, { units: 800_000 }));

      // Add mint instructions for each NFT using mintV2
      const mintedNfts = [];
      for (let i = 0; i < mintAmount; i++) {
        const nftMint = generateSigner(this.umi);
        console.log(`Generating NFT ${i + 1}/${mintAmount}:`, nftMint.publicKey.toString());

        builder = builder.add(
          mintV2(this.umi, {
            candyMachine: this.candyMachine.publicKey,
            nftMint,
            collectionMint: this.candyMachine.collectionMint,
            collectionUpdateAuthority: this.candyMachine.authority,
            candyGuard: this.candyGuard.publicKey,
            mintArgs,
          })
        );

        mintedNfts.push({
          mint: nftMint.publicKey,
          name: 'Blinky OG VIP NFT'
        });
      }

      console.log('Sending transaction for wallet approval...');
      
      // Send transaction with proper configuration
      const result = await builder.sendAndConfirm(this.umi, {
        confirm: { commitment: 'confirmed' },
        send: { 
          skipPreflight: false,
          maxRetries: 3
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
      
      console.log('NFT mint successful! Signature:', signatureString);
      
      return {
        success: true,
        signature: signatureString,
        nft: mintedNfts.length === 1 ? mintedNfts[0] : mintedNfts
      };
      
    } catch (error: any) {
      console.error('NFT mint failed:', error);
      
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
