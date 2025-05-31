/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC_ENDPOINT: string;
  readonly VITE_CANDY_MACHINE_ID: string;
  readonly VITE_CANDY_GUARD_ID: string;
  readonly VITE_TOKEN_MINT: string;
  readonly VITE_TOKEN_AMOUNT: string;
  readonly VITE_TREASURY_WALLET: string;
  readonly VITE_TREASURY_OWNER: string;
  readonly VITE_PAYMENT_DESTINATION_ATA: string;
  readonly VITE_COLLECTION_MINT: string;
  readonly VITE_COLLECTION_UPDATE_AUTHORITY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}