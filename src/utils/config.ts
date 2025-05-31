
import { PublicKey } from '@solana/web3.js';

// Safely access environment variables or provide fallbacks
export const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT || "";

// Parse PublicKey values safely
export const CANDY_MACHINE_ID = new PublicKey(import.meta.env.VITE_CANDY_MACHINE_ID || "11111111111111111111111111111111");
export const CANDY_GUARD_ID = new PublicKey(import.meta.env.VITE_CANDY_GUARD_ID || "11111111111111111111111111111111");
export const TOKEN_MINT = new PublicKey(import.meta.env.VITE_TOKEN_MINT || "11111111111111111111111111111111");
export const TOKEN_AMOUNT = BigInt(import.meta.env.VITE_TOKEN_AMOUNT || "0");
export const TREASURY_WALLET = new PublicKey(import.meta.env.VITE_TREASURY_WALLET || "11111111111111111111111111111111");
export const TREASURY_OWNER = new PublicKey(import.meta.env.VITE_TREASURY_OWNER || "11111111111111111111111111111111");
export const COLLECTION_MINT = new PublicKey(import.meta.env.VITE_COLLECTION_MINT || "11111111111111111111111111111111");
export const COLLECTION_UPDATE_AUTHORITY = new PublicKey(import.meta.env.VITE_COLLECTION_UPDATE_AUTHORITY || "11111111111111111111111111111111");
export const PAYMENT_DESTINATION_ATA = new PublicKey(import.meta.env.VITE_PAYMENT_DESTINATION_ATA || import.meta.env.VITE_TREASURY_WALLET || "11111111111111111111111111111111");