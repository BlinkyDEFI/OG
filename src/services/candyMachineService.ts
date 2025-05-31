import {
  generateSigner,
  transactionBuilder,
  unwrapOption,
  setComputeUnitLimit,
  some,
  PublicKey as UmiPublicKey,
} from '@metaplex-foundation/umi';
import { mintV2, DefaultGuardSetMintArgs } from '@metaplex-foundation/mpl-candy-machine';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { PublicKey } from '@solana/web3.js';
import { Umi } from '@metaplex-foundation/umi';

export interface MintResult {
  success: boolean;
  nft?: {
    mint: UmiPublicKey;
    signature: string;
    name: string;
  } | {
    mint: UmiPublicKey;
    signature: string;
    name: string;
  }[];
  error?: string;
}

export class CandyMachineMintService {
  constructor(
    private readonly umi: Umi,
    private readonly candyMachine: any,
    private readonly candyGuard: any,
    private readonly TOKEN_MINT: PublicKey,
    private readonly PAYMENT_DESTINATION_ATA: PublicKey,
    private readonly TOKEN_AMOUNT: number
  ) {}

  async mint(mintAmount: number = 1): Promise<MintResult> {
    if (!this.candyMachine || !this.candyGuard) {
      throw new Error('Candy Machine v3 not initialized');
    }

    try {
      console.log(`Starting mint process for ${mintAmount} NFT(s)`);

      const totalTokenAmount = Number(this.TOKEN_AMOUNT) * mintAmount;
      const costBlinky = totalTokenAmount / 1_000_000;
      console.log(`Total cost: ${costBlinky} BLINKY tokens`);

      const mintedNfts = [];

      let mintArgs: Partial<DefaultGuardSetMintArgs> = {};

      const tokenPayment = unwrapOption(this.candyGuard.guards.tokenPayment);
      if (tokenPayment) {
        console.log('Token payment guard found, adding mint args');
        console.log('Token mint:', this.TOKEN_MINT.toString());
        console.log('Payment destination ATA:', this.PAYMENT_DESTINATION_ATA.toString());

        mintArgs.tokenPayment = some({
          mint: this.umi.publicKey(this.TOKEN_MINT.toString()),
          destinationAta: this.umi.publicKey(this.PAYMENT_DESTINATION_ATA.toString()),
        });
      }

      const mintLimit = unwrapOption(this.candyGuard.guards.mintLimit);
      if (mintLimit) {
        console.log('Mint limit guard found, adding mint args');
        mintArgs.mintLimit = some({ id: mintLimit.id });
      }

      for (let i = 0; i < mintAmount; i++) {
        const nftMint = generateSigner(this.umi);
        console.log(`Generating NFT ${i + 1}/${mintAmount}:`, nftMint.publicKey.toString());

        const builder = transactionBuilder()
          .add(setComputeUnitLimit(this.umi, { units: 800_000 }))
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

        console.log(`Prompting wallet to approve mint ${i + 1}...`);

        const result = await builder.sendAndConfirm(this.umi, {
          confirm: { commitment: 'confirmed' },
          send: {
            skipPreflight: false,
            maxRetries: 3,
          },
        });

        const signatureString = typeof result.signature === 'string'
          ? result.signature
          : bs58.encode(result.signature);

        console.log(`✅ NFT ${i + 1} minted successfully! Signature: ${signatureString}`);

        mintedNfts.push({
          mint: nftMint.publicKey,
          signature: signatureString,
          name: 'Blinky OG VIP NFT',
        });
      }

      return {
        success: true,
        nft: mintedNfts.length === 1 ? mintedNfts[0] : mintedNfts,
      };

    } catch (error: any) {
      console.error('❌ NFT mint failed:', error);

      let errorMessage = 'Unknown minting error';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.toString) {
        errorMessage = error.toString();
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
