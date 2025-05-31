import React from "react";
import { useState, useEffect } from "react";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import { UmiProvider } from "@/components/UmiProvider";
import MintingApp from "@/components/MintingApp";

const Index = () => {
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if content is ready to render
  if (!isMounted) {
    return null;
  }

  return (
    <WalletContextProvider>
     <UmiProvider>
        <MintingApp />
      </UmiProvider>
    </WalletContextProvider>
  );
};

export default Index;
