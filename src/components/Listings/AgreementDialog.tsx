"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/SharedComponent/Dialog";
import { useCivicAuth } from "@/context/CivicAuthContext";
import { useMetaMask } from "@/context/MetaMaskContext";
import { Button } from "@/components/SharedComponent/Button";
import { toast } from "react-hot-toast";
import { mintNFTOnAvalanche, getContractInfo } from "@/services/avalancheService";
import { NFT } from "@/types/nft";

interface AgreementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    host: {
      name: string;
      email: string;
    };
  };
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}

const AgreementDialog: React.FC<AgreementDialogProps> = ({
  isOpen,
  onClose,
  listing,
  checkIn,
  checkOut,
  totalPrice,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'agreement' | 'processing' | 'complete'>('agreement');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [contractInfo, setContractInfo] = useState<any>(null);
  
  // Authentication contexts
  const { isConnected: isCivicConnected, address: civicAddress, user: civicUser } = useCivicAuth();
  const { user: metaMaskUser } = useMetaMask();
  
  const isMetaMaskConnected = metaMaskUser.isConnected;

  // Get contract info on mount
  useEffect(() => {
    const fetchContractInfo = async () => {
      if (isMetaMaskConnected) {
        try {
          const info = await getContractInfo();
          setContractInfo(info);
        } catch (error) {
          console.error('Error fetching contract info:', error);
        }
      }
    };
    fetchContractInfo();
  }, [isMetaMaskConnected]);

  // Mock NFT metadata for agreement
  const nftMetadata = {
    propertyAddress: listing.title,
    currentHeight: 45,
    maximumHeight: 200,
    availableFloors: 26,
    floorAreaRatio: "2.5",
    zoneCode: "R-4",
    buildableArea: "84058 sqm",
    developmentPotential: "High-density mixed-use",
    coordinates: { lat: 43.0896, lng: -79.0849 }
  };

  // Generate the air rights purchase agreement
  const generateAgreement = () => {
    const currentDate = new Date().toLocaleDateString();
    const userName = civicUser?.name || civicUser?.email || metaMaskUser?.address || "Buyer";
    const userEmail = civicUser?.email || "Not provided";
    const userAddress = civicAddress || metaMaskUser?.address || "Not connected";

    return `AIR RIGHTS PURCHASE AND TRANSFER AGREEMENT

AGREEMENT BETWEEN ${listing.host.name.toUpperCase()} AND ${userName.toUpperCase()}

This Air Rights Purchase and Transfer Agreement ("Agreement") is entered into as of ${currentDate}, by and between ${listing.host.name}, a limited liability company ("Seller"), and ${userName} ("Buyer").

PROPERTY DETAILS AND AIR RIGHTS SPECIFICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Property Address: ${nftMetadata.propertyAddress}
Current Building Height: ${nftMetadata.currentHeight} meters
Maximum Allowable Height: ${nftMetadata.maximumHeight} meters
Available Development Height: ${nftMetadata.maximumHeight - nftMetadata.currentHeight} meters
Estimated Additional Floors: ${nftMetadata.availableFloors} floors
Floor Area Ratio (FAR): ${nftMetadata.floorAreaRatio}
Zoning Code: ${nftMetadata.zoneCode}
Total Buildable Area: ${nftMetadata.buildableArea}
Development Potential: ${nftMetadata.developmentPotential}
Coordinates: ${nftMetadata.coordinates.lat}, ${nftMetadata.coordinates.lng}

BLOCKCHAIN TRANSACTION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purchase Price: ${totalPrice.toLocaleString()} ${listing.currency}
Buyer Wallet Address: ${userAddress}
NFT Token Standard: ERC-721 (Avalanche)
Smart Contract Address: ${contractInfo?.contractAddress || 'Loading...'}
Network: Avalanche Fuji Testnet
Cross-Chain Compatibility: ✓ Chainlink CCIP Enabled

TERMS AND CONDITIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PURCHASE PRICE AND PAYMENT TERMS
   The total purchase price for the air rights shall be ${totalPrice.toLocaleString()} ${listing.currency}. 
   Payment shall be made via blockchain transaction on Avalanche Fuji Testnet. Upon confirmation, 
   Seller shall transfer the corresponding NFT representing the air rights to Buyer's designated wallet address.

2. NFT REPRESENTATION
   The air rights will be represented as a unique Non-Fungible Token (NFT) containing:
   - Property coordinates and zoning information
   - Development rights and building restrictions
   - Transfer history and ownership provenance
   - 3D visualization metadata of available airspace

3. BLOCKCHAIN NETWORK
   This transaction will be executed on:
   - Avalanche Fuji Testnet (Primary)
   - Smart Contract: ${contractInfo?.contractAddress || 'Loading...'}
   - Cross-chain transfers enabled via Chainlink CCIP protocol

4. DEVELOPMENT RIGHTS AND RESTRICTIONS
   Buyer acknowledges that the air rights are subject to:
   - Current zoning: ${nftMetadata.zoneCode} with FAR ${nftMetadata.floorAreaRatio}
   - Maximum building height: ${nftMetadata.maximumHeight}
   - Environmental and permit requirements
   - Municipal building codes and regulations

5. SMART CONTRACT GUARANTEES
   - Immutable ownership record on Avalanche blockchain
   - Automated royalty distribution (2.5% to platform)
   - Escrow protection during transaction
   - Cross-chain compatibility for future transfers

By proceeding with this transaction, both parties acknowledge that they have read, understood, 
and agree to be bound by all terms and conditions set forth in this Agreement.

The NFT representing these air rights will be minted upon successful payment and transferred 
to the buyer's wallet address: ${userAddress}`;
  };

  const handlePurchase = async () => {
    if (!agreed) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!isMetaMaskConnected) {
      toast.error("Please connect your MetaMask wallet to proceed");
      return;
    }

    setCurrentStep('processing');
    setProcessing(true);

    try {
      toast.loading("Processing your Air Rights purchase...", { id: 'purchase' });

      // Convert listing to NFT format for Avalanche minting
      const nftData: NFT = {
        id: listing.id,
        name: listing.title,
        title: listing.title,
        description: `Air Rights NFT for ${listing.title}`,
        thumbnail: "",
        token_id: parseInt(listing.id) || 1,
        propertyAddress: `${listing.title} - Air Rights`,
        currentHeight: nftMetadata.currentHeight,
        maximumHeight: nftMetadata.maximumHeight,
        availableFloors: nftMetadata.availableFloors,
        price: totalPrice,
        latitude: nftMetadata.coordinates.lat,
        longitude: nftMetadata.coordinates.lng
      };

      // Mint NFT on Avalanche blockchain
      const mintResult = await mintNFTOnAvalanche(nftData, metaMaskUser.address || '');
      
      setTransactionDetails({
        txHash: mintResult.transactionHash,
        tokenId: mintResult.tokenId,
        blockNumber: mintResult.blockNumber,
        gasUsed: mintResult.gasUsed,
        explorerUrl: mintResult.explorerUrl,
        network: 'Avalanche Fuji Testnet',
        contractAddress: contractInfo?.contractAddress,
        verified: true
      });

      toast.success("Air Rights NFT successfully minted! 🎉", { id: 'purchase' });
      setCurrentStep('complete');

    } catch (error: any) {
      console.error("Purchase failed:", error);
      toast.error(`Purchase failed: ${error.message || 'Unknown error'}`, { id: 'purchase' });
      setCurrentStep('agreement');
    } finally {
      setProcessing(false);
    }
  };

  const renderProcessingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
          <span className="text-white text-2xl">⚡</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Processing Transaction...</h3>
        <p className="text-gray-300">Please wait while we mint your Air Rights NFT on Avalanche</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
          <span className="text-white">Connected to Avalanche Fuji Testnet</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
            <span className="text-white text-sm">⚡</span>
          </div>
          <span className="text-white">Minting NFT on blockchain...</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">⏳</span>
          </div>
          <span className="text-gray-400">Waiting for transaction confirmation...</span>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-300">
          <strong>Note:</strong> This may take 1-2 minutes. Please don't close this window.
        </p>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">✓</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Purchase Complete! 🎉</h3>
        <p className="text-gray-300">Your Air Rights NFT has been successfully minted on Avalanche</p>
      </div>

      {/* Transaction Details */}
      {transactionDetails && (
        <div className="bg-gradient-to-r from-green-900 to-blue-900 p-6 rounded-lg border border-green-700 overflow-hidden">
          <h4 className="text-white font-bold mb-4">Transaction Details:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-300">Network:</span>
              <span className="text-white ml-2">{transactionDetails.network}</span>
            </div>
            <div>
              <span className="text-gray-300">Transaction Hash:</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(transactionDetails.txHash);
                  toast.success('Transaction hash copied to clipboard!');
                }}
                className="text-blue-400 hover:text-blue-300 ml-2 font-mono text-xs underline cursor-pointer transition-colors"
                title="Click to copy full hash"
              >
                {transactionDetails.txHash.slice(0, 8)}...{transactionDetails.txHash.slice(-8)}
              </button>
            </div>
            <div>
              <span className="text-gray-300">Token ID:</span>
              <span className="text-white ml-2 font-mono">#{transactionDetails.tokenId}</span>
            </div>
            <div>
              <span className="text-gray-300">Block Number:</span>
              <span className="text-white ml-2 font-mono">{transactionDetails.blockNumber}</span>
            </div>
            <div>
              <span className="text-gray-300">Gas Used:</span>
              <span className="text-white ml-2 font-mono">{transactionDetails.gasUsed}</span>
            </div>
            <div>
              <span className="text-gray-300">Status:</span>
              <span className="text-green-400 ml-2 font-mono">✓ Confirmed</span>
            </div>
          </div>
        </div>
      )}

      {/* Your Air Rights NFT */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6 rounded-lg border border-purple-700">
        <h4 className="text-white font-bold mb-4">Your Air Rights NFT:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-300">Property:</span>
            <span className="text-white ml-2">{listing.title}</span>
          </div>
          <div>
            <span className="text-gray-300">Development Rights:</span>
            <span className="text-white ml-2">{nftMetadata.availableFloors} floors</span>
          </div>
          <div>
            <span className="text-gray-300">Height Range:</span>
            <span className="text-white ml-2">{nftMetadata.currentHeight}m - {nftMetadata.maximumHeight}m</span>
          </div>
          <div>
            <span className="text-gray-300">Development Potential:</span>
            <span className="text-white ml-2">{nftMetadata.buildableArea}</span>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 rounded-lg border border-indigo-700">
        <h4 className="text-white font-bold mb-4">What's Next?</h4>
        <ul className="text-gray-300 space-y-2">
          <li>• Your NFT is now visible in your MetaMask wallet</li>
          <li>• View transaction details on Avalanche Explorer</li>
          <li>• Transfer to other chains using CCIP bridge</li>
          <li>• List for resale on the AirSpace marketplace</li>
          <li>• Start planning your development project!</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-3">
        <Button
          onClick={() => window.open(transactionDetails?.explorerUrl, '_blank')}
          variant="outline"
          className="min-w-[150px]"
        >
          View on Explorer
        </Button>
        <Button
          onClick={() => window.open('https://ccip.chain.link/', '_blank')}
          variant="outline"
          className="min-w-[150px] border-orange-600 text-orange-400 hover:bg-orange-900"
        >
          CCIP Bridge
        </Button>
        <Button
          onClick={onClose}
          className="min-w-[150px] bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
        >
          Done
        </Button>
      </div>
    </div>
  );

  const renderAgreementStep = () => (
    <div className="space-y-6">
      {/* Authentication Status */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h4 className="font-medium mb-2 text-white">Authentication Status:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">MetaMask:</span>
            <span className={`font-semibold ${isMetaMaskConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isMetaMaskConnected ? '✓ Connected' : '✗ Not Connected'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Civic Auth:</span>
            <span className={`font-semibold ${isCivicConnected ? 'text-green-400' : 'text-yellow-400'}`}>
              {isCivicConnected ? '✓ Connected' : '○ Optional'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Blockchain:</span>
            <span className="font-semibold text-red-400">Avalanche Fuji Testnet</span>
          </div>
        </div>
      </div>

      {/* Contract Information */}
      {contractInfo && (
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-4 rounded-lg border border-blue-700">
          <h4 className="font-medium mb-2 text-white">Smart Contract Information:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Contract Address:</span>
              <span className="font-mono text-xs text-white">{contractInfo.contractAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Contract Owner:</span>
              <span className="font-mono text-xs text-white">{contractInfo.owner}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Network:</span>
              <span className="text-white">Avalanche Fuji Testnet</span>
            </div>
          </div>
        </div>
      )}

      {/* Agreement Text */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
          {generateAgreement()}
        </pre>
      </div>

      {/* Agreement Checkbox */}
      <div className="flex items-center space-x-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <input
          type="checkbox"
          id="agree"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label htmlFor="agree" className="text-sm text-white">
          I agree to the terms and conditions of this Air Rights Purchase Agreement and understand the blockchain implications
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        <Button
          onClick={handlePurchase}
          disabled={!agreed || !isMetaMaskConnected || processing}
          className="min-w-[200px] bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white"
        >
          {!isMetaMaskConnected ? 'Connect MetaMask First' : 'Purchase on Avalanche →'}
        </Button>
      </div>
    </div>
  );

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 'agreement':
        return renderAgreementStep();
      case 'processing':
        return renderProcessingStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderAgreementStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">
            {currentStep === 'agreement' && 'Air Rights Purchase Agreement'}
            {currentStep === 'processing' && 'Processing Purchase'}
            {currentStep === 'complete' && 'Purchase Complete'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            {['agreement', 'processing', 'complete'].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`w-3 h-3 rounded-full ${
                  currentStep === step ? 'bg-red-500' : 
                  ['agreement', 'processing', 'complete'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-600'
                }`}></div>
                {index < 2 && <div className="w-8 h-0.5 bg-gray-600"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {getCurrentStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default AgreementDialog; 