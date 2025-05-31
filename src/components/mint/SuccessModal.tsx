
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nftName: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ 
  open, 
  onOpenChange, 
  nftName 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-green-400 text-xl">
            NFT Minted Successfully!
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-4">
          <video
            src="https://gateway.irys.xyz/NGY5Uo_lDb4F4PBHoMN8WsYwh0A6n7FMElVJh6P9mL4?ext=mp4"
            autoPlay
            loop
            muted
            className="w-48 h-auto rounded-lg mb-4"
          />
          <p className="text-green-400 text-center">
            Congratulations! You've minted a {nftName}!
          </p>
          <Button 
            className="mt-4 bg-green-500 hover:bg-green-600 text-white"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
