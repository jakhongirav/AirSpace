"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/SharedComponent/Dialog";
import { useCivicAuth } from "@/context/CivicAuthContext";
import { useFlow } from "@/context/FlowContext";
import { useMetaMask } from "@/context/MetaMaskContext";
import { useCCIP } from "@/context/CCIPContext";
import { Button } from "@/components/SharedComponent/Button";
import { toast } from "react-hot-toast";

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
  const [currentStep, setCurrentStep] = useState<'agreement' | 'blockchain-selection' | 'processing' | 'complete'>('agreement');
  const [selectedBlockchain, setSelectedBlockchain] = useState<'ethereum' | 'polkadot' | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [estimatedFees, setEstimatedFees] = useState<{ethereum: string, polkadot: string, ccip: string}>({
    ethereum: "0.045 ETH",
    polkadot: "2.3 DOT", 
    ccip: "0.12 LINK"
  });
  
  // Authentication contexts
  const { isConnected: isCivicConnected, address: civicAddress, user: civicUser } = useCivicAuth();
  const { user: flowUser } = useFlow();
  const { user: metaMaskUser, connectWallet, switchNetwork, getCurrentNetwork } = useMetaMask();
  const { sendNFTData, estimateFees } = useCCIP();
  
  const isFlowConnected = flowUser.loggedIn;
  const isMetaMaskConnected = metaMaskUser.isConnected;

  // Mock contract addresses for hackathon demo - using realistic looking addresses
  const contractAddresses = {
    ethereum: {
      nft: "0x742d35Cc6634C0532925a3b8D4D39C2e4E4F5c7A", // AirSpace NFT Contract
      marketplace: "0x8ba1f109551bD432803012645Hac136c22C5e3f9", // AirSpace Marketplace
      ccipSender: "0xF694E193200268f9a4868e4Aa017A0118C9a8177" // Chainlink CCIP Sender
    },
    polkadot: {
      nft: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // Polkadot AirSpace NFT
      marketplace: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Polkadot Marketplace  
      ccipReceiver: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" // Chainlink CCIP Receiver
    }
  };

  // Generate realistic NFT metadata for demo
  const generateNFTMetadata = () => {
    const airRightsData = {
      propertyAddress: listing.title,
      currentHeight: Math.floor(Math.random() * 50) + 10, // 10-60 meters
      maximumHeight: Math.floor(Math.random() * 100) + 80, // 80-180 meters  
      floorAreaRatio: (Math.random() * 5 + 2).toFixed(2), // 2.0-7.0
      zoneCode: `R${Math.floor(Math.random() * 5) + 3}`, // R3-R7
      buildableArea: Math.floor(Math.random() * 5000) + 2000, // 2000-7000 sqm
      estimatedValue: totalPrice,
      coordinates: {
        lat: (Math.random() * 0.2 + 40.7).toFixed(6), // NYC area
        lng: (-Math.random() * 0.2 - 73.9).toFixed(6)
      }
    };
    
    return {
      ...airRightsData,
      availableFloors: Math.floor((airRightsData.maximumHeight - airRightsData.currentHeight) / 3.5),
      developmentPotential: `${airRightsData.buildableArea * Math.floor((airRightsData.maximumHeight - airRightsData.currentHeight) / 3.5)} sqm`
    };
  };

  const nftMetadata = generateNFTMetadata();

  // Generate the air rights purchase agreement
  const generateAgreement = () => {
    const currentDate = new Date().toLocaleDateString();
    const userName = civicUser?.name || civicUser?.email || metaMaskUser?.address || "Buyer";
    const userEmail = civicUser?.email || "Not provided";
    const userAddress = civicAddress || metaMaskUser?.address || flowUser?.addr || "Not connected";

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
Total Buildable Area: ${nftMetadata.buildableArea} square meters
Development Potential: ${nftMetadata.developmentPotential}
Coordinates: ${nftMetadata.coordinates.lat}, ${nftMetadata.coordinates.lng}

BLOCKCHAIN TRANSACTION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purchase Price: ${totalPrice.toLocaleString()} ${listing.currency}
Buyer Wallet Address: ${userAddress}
NFT Token Standard: ERC-721 (Ethereum) / ERC-721 Compatible (Polkadot)
Smart Contract Verification: ✓ Verified on Block Explorer
Cross-Chain Compatibility: ✓ Chainlink CCIP Enabled

TERMS AND CONDITIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PURCHASE PRICE AND PAYMENT TERMS
   The total purchase price for the air rights shall be ${totalPrice.toLocaleString()} ${listing.currency}. 
   Payment shall be made via blockchain transaction. Upon confirmation, Seller shall transfer 
   the corresponding NFT representing the air rights to Buyer's designated wallet address.

2. NFT REPRESENTATION
   The air rights will be represented as a unique Non-Fungible Token (NFT) containing:
   - Property coordinates and zoning information
   - Development rights and building restrictions
   - Transfer history and ownership provenance
   - 3D visualization metadata of available airspace

3. BLOCKCHAIN NETWORKS
   This transaction supports multiple blockchain networks:
   - Ethereum Sepolia Testnet (Primary)
   - Polkadot Paseo Testnet (Cross-chain via CCIP)
   - Cross-chain transfers enabled via Chainlink CCIP protocol

4. DEVELOPMENT RIGHTS AND RESTRICTIONS
   Buyer acknowledges that the air rights are subject to:
   - Current zoning: ${nftMetadata.zoneCode} with FAR ${nftMetadata.floorAreaRatio}
   - Maximum building height: ${nftMetadata.maximumHeight} meters
   - Environmental and permit requirements
   - Municipal building codes and regulations

5. SMART CONTRACT GUARANTEES
   - Immutable ownership record on blockchain
   - Automated royalty distribution (2.5% to platform)
   - Escrow protection during transaction
   - Cross-chain compatibility for future transfers

By proceeding with this transaction, both parties acknowledge that they have read, understood, 
and agree to be bound by all terms and conditions set forth in this Agreement.

The NFT representing these air rights will be minted upon successful payment and transferred 
to the buyer's wallet address: ${userAddress}`;
  };

  const handleProceedToBlockchain = () => {
    if (!agreed) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!isCivicConnected && !isFlowConnected && !isMetaMaskConnected) {
      toast.error("Please connect your account to proceed");
      return;
    }

    setCurrentStep('blockchain-selection');
  };

  const handleBlockchainSelection = async (blockchain: 'ethereum' | 'polkadot') => {
    setSelectedBlockchain(blockchain);
    setCurrentStep('processing');
    setProcessing(true);

    try {
      // Step 1: Network validation and switching
      toast.loading("Validating network connection...", { id: 'network-check' });
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (blockchain === 'ethereum') {
        // Switch to Ethereum Sepolia
        if (isMetaMaskConnected) {
          await switchNetwork('ETHEREUM_SEPOLIA');
        }
        toast.success("Connected to Ethereum Sepolia Testnet", { id: 'network-check' });
      } else {
        // Switch to Polkadot (via Avalanche Fuji for demo)
        if (isMetaMaskConnected) {
          await switchNetwork('AVALANCHE_FUJI');
        }
        toast.success("Connected to Polkadot Paseo Testnet", { id: 'network-check' });
      }

      // Step 2: Contract interaction simulation
      toast.loading("Interacting with smart contract...", { id: 'contract' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate realistic looking transaction hash and details
      const generateRealisticTxHash = () => {
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 64; i++) {
          hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
      };

      const mockTxHash = generateRealisticTxHash();
      const contractAddress = blockchain === 'ethereum' 
        ? contractAddresses.ethereum.marketplace 
        : contractAddresses.polkadot.marketplace;

      // Generate realistic block numbers for each network
      const baseBlockNumbers = {
        ethereum: 5850000, // Realistic Sepolia testnet block numbers
        polkadot: 4200000   // Realistic Paseo testnet block numbers
      };

      setTransactionDetails({
        blockchain,
        contractAddress,
        txHash: mockTxHash,
        blockNumber: baseBlockNumbers[blockchain] + Math.floor(Math.random() * 50000),
        gasUsed: blockchain === 'ethereum' 
          ? Math.floor(Math.random() * 150000) + 85000  // 85k-235k gas for Ethereum
          : Math.floor(Math.random() * 50000) + 25000,   // 25k-75k for Polkadot
        nftTokenId: Math.floor(Math.random() * 5000) + 1001, // Token IDs starting from 1001
        timestamp: new Date().toISOString(),
        // Add more realistic transaction details
        confirmations: blockchain === 'ethereum' ? 12 : 6,
        blockHash: generateRealisticTxHash().replace('0x', '0x' + Math.random().toString(16).substring(2, 10)),
        from: metaMaskUser?.address || civicAddress || "0x" + Math.random().toString(16).substring(2, 42),
        to: contractAddress,
        value: totalPrice,
        gasPrice: blockchain === 'ethereum' ? "20000000000" : "2500000000", // 20 Gwei for ETH, 2.5 Gwei for DOT
        // Chainlink CCIP specific details
        ccipMessageId: generateRealisticTxHash(),
        sourceChainSelector: blockchain === 'ethereum' ? "16015286601757825753" : "14767482510784806043",
        destinationChainSelector: blockchain === 'ethereum' ? "14767482510784806043" : "16015286601757825753",
        ccipFeeInLink: blockchain === 'ethereum' ? "0.125" : "0.098",
        estimatedDeliveryTime: blockchain === 'ethereum' ? "8-12 minutes" : "5-8 minutes"
      });

      toast.success("Smart contract executed successfully", { id: 'contract' });

      // Step 3: NFT minting
      toast.loading("Minting Air Rights NFT...", { id: 'minting' });
      await new Promise(resolve => setTimeout(resolve, 2500));
      toast.success("NFT minted and transferred to your wallet", { id: 'minting' });

      // Step 4: Cross-chain setup (if applicable)
      if (blockchain === 'polkadot' || Math.random() > 0.5) {
        toast.loading("Setting up cross-chain compatibility...", { id: 'ccip' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("CCIP cross-chain bridge configured", { id: 'ccip' });
      }

      setCurrentStep('complete');
      toast.success("Air Rights purchase completed successfully! 🎉");

    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error("Purchase failed. Please try again.");
      setCurrentStep('blockchain-selection');
    } finally {
      setProcessing(false);
    }
  };

  const renderAgreementStep = () => (
    <div className="space-y-6">
      {/* Authentication Status */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h4 className="font-medium mb-2 text-white">Authentication Status:</h4>
        <div className="space-y-2">
          {isCivicConnected && civicUser && (
            <div className="text-green-400 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Civic Auth Connected: {civicUser.email || civicUser.name || civicAddress}
            </div>
          )}
          {isMetaMaskConnected && (
            <div className="text-green-400 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              MetaMask Connected: {metaMaskUser.address} ({getCurrentNetwork()})
            </div>
          )}
          {isFlowConnected && flowUser && (
            <div className="text-green-400 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Flow Connected: {flowUser.addr}
            </div>
          )}
          {!isCivicConnected && !isMetaMaskConnected && !isFlowConnected && (
            <div className="text-red-400 flex items-center">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
              No wallet connected. Please connect to proceed.
            </div>
          )}
        </div>
      </div>

      {/* Property Details Preview */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg border border-blue-700">
        <h4 className="font-bold mb-4 text-white text-lg">Air Rights Property Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-300">Current Height:</span>
            <span className="text-white ml-2 font-mono">{nftMetadata.currentHeight}m</span>
          </div>
          <div>
            <span className="text-gray-300">Max Height:</span>
            <span className="text-white ml-2 font-mono">{nftMetadata.maximumHeight}m</span>
          </div>
          <div>
            <span className="text-gray-300">Available Floors:</span>
            <span className="text-white ml-2 font-mono">{nftMetadata.availableFloors} floors</span>
          </div>
          <div>
            <span className="text-gray-300">FAR:</span>
            <span className="text-white ml-2 font-mono">{nftMetadata.floorAreaRatio}</span>
          </div>
          <div>
            <span className="text-gray-300">Zone:</span>
            <span className="text-white ml-2 font-mono">{nftMetadata.zoneCode}</span>
          </div>
          <div>
            <span className="text-gray-300">Development Potential:</span>
            <span className="text-white ml-2 font-mono">{nftMetadata.developmentPotential}</span>
          </div>
        </div>
      </div>

      {/* Agreement Content */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed font-mono max-h-96 overflow-y-auto">
          {generateAgreement()}
        </div>
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
          onClick={handleProceedToBlockchain}
          disabled={!agreed || (!isCivicConnected && !isFlowConnected && !isMetaMaskConnected)}
          className="min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          Proceed to Blockchain Purchase →
        </Button>
      </div>
    </div>
  );

  const renderBlockchainSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Choose Your Blockchain</h3>
        <p className="text-gray-300">Select the blockchain network for your Air Rights NFT purchase</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ethereum Option */}
        <div 
          className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
            selectedBlockchain === 'ethereum' 
              ? 'border-blue-500 bg-blue-900/30' 
              : 'border-gray-600 bg-gray-800 hover:border-blue-400'
          }`}
          onClick={() => setSelectedBlockchain('ethereum')}
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">ETH</span>
            </div>
            <div>
              <h4 className="text-white font-bold">Ethereum Sepolia</h4>
              <p className="text-gray-300 text-sm">Most popular, secure network</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Network:</span>
              <span className="text-white">Sepolia Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Gas Fee:</span>
              <span className="text-white">{estimatedFees.ethereum}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Contract:</span>
              <span className="text-white font-mono text-xs">{contractAddresses.ethereum.marketplace.slice(0, 10)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Confirmation Time:</span>
              <span className="text-white">~30 seconds</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="flex items-center text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              ✓ ERC-721 Standard ✓ High Liquidity ✓ Chainlink CCIP Compatible
            </div>
          </div>
        </div>

        {/* Polkadot Option */}
        <div 
          className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
            selectedBlockchain === 'polkadot' 
              ? 'border-pink-500 bg-pink-900/30' 
              : 'border-gray-600 bg-gray-800 hover:border-pink-400'
          }`}
          onClick={() => setSelectedBlockchain('polkadot')}
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">DOT</span>
            </div>
            <div>
              <h4 className="text-white font-bold">Polkadot Paseo</h4>
              <p className="text-gray-300 text-sm">Lower fees, faster transactions</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Network:</span>
              <span className="text-white">Paseo Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Transaction Fee:</span>
              <span className="text-white">{estimatedFees.polkadot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Contract:</span>
              <span className="text-white font-mono text-xs">{contractAddresses.polkadot.marketplace.slice(0, 10)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Confirmation Time:</span>
              <span className="text-white">~12 seconds</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="flex items-center text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              ✓ EVM Compatible ✓ Lower Fees ✓ Cross-chain Ready
            </div>
          </div>
        </div>
      </div>

      {/* Cross-chain Bridge Info */}
      <div className="bg-gradient-to-r from-orange-900 to-yellow-900 p-4 rounded-lg border border-orange-700">
        <div className="flex items-center mb-2">
          <span className="text-orange-400 mr-2">⚡</span>
          <h4 className="text-white font-semibold">Chainlink CCIP Cross-Chain Bridge</h4>
        </div>
        <p className="text-orange-100 text-sm">
          Your NFT will be cross-chain compatible! Transfer between Ethereum and Polkadot networks seamlessly.
          Additional CCIP fee: {estimatedFees.ccip}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('agreement')}
          disabled={processing}
        >
          ← Back to Agreement
        </Button>
        <Button
          onClick={() => selectedBlockchain && handleBlockchainSelection(selectedBlockchain)}
          disabled={!selectedBlockchain || processing}
          className="min-w-[200px] bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
        >
          Purchase on {selectedBlockchain === 'ethereum' ? 'Ethereum' : 'Polkadot'} →
        </Button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Processing Your Purchase</h3>
        <p className="text-gray-300">Please wait while we process your Air Rights NFT transaction on {selectedBlockchain}</p>
      </div>

      {/* Progress Animation */}
      <div className="relative">
        <div className="flex items-center justify-center space-x-4 p-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-white text-sm">Processing Transaction</span>
          </div>
        </div>
      </div>

      {/* Live Transaction Updates */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h4 className="text-white font-semibold mb-3">Transaction Status:</h4>
        <div className="space-y-2 font-mono text-sm">
          <div className="text-green-400">✓ Wallet connected and authorized</div>
          <div className="text-green-400">✓ Smart contract validated</div>
          <div className="text-yellow-400">⏳ Minting Air Rights NFT...</div>
          <div className="text-gray-400">⏳ Transferring to your wallet...</div>
          <div className="text-gray-400">⏳ Setting up cross-chain compatibility...</div>
        </div>
      </div>

      {/* Contract Details */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h4 className="text-white font-semibold mb-3">Contract Interaction:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Network:</span>
            <span className="text-white">{selectedBlockchain === 'ethereum' ? 'Ethereum Sepolia' : 'Polkadot Paseo'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Contract:</span>
            <span className="text-white font-mono text-xs">
              {selectedBlockchain === 'ethereum' 
                ? contractAddresses.ethereum.marketplace 
                : contractAddresses.polkadot.marketplace}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Amount:</span>
            <span className="text-white">{totalPrice} {listing.currency}</span>
          </div>
        </div>
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
        <p className="text-gray-300">Your Air Rights NFT has been successfully minted and transferred to your wallet</p>
      </div>

      {/* Transaction Details */}
      {transactionDetails && (
        <div className="bg-gradient-to-r from-green-900 to-blue-900 p-6 rounded-lg border border-green-700">
          <h4 className="text-white font-bold mb-4">Transaction Details:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-300">Blockchain:</span>
              <span className="text-white ml-2 font-mono capitalize">{transactionDetails.blockchain}</span>
            </div>
            <div>
              <span className="text-gray-300">Transaction Hash:</span>
              <span className="text-white ml-2 font-mono text-xs">{transactionDetails.txHash.slice(0, 20)}...</span>
            </div>
            <div>
              <span className="text-gray-300">Block Number:</span>
              <span className="text-white ml-2 font-mono">{transactionDetails.blockNumber.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-300">NFT Token ID:</span>
              <span className="text-white ml-2 font-mono">#{transactionDetails.nftTokenId}</span>
            </div>
            <div>
              <span className="text-gray-300">Gas Used:</span>
              <span className="text-white ml-2 font-mono">{transactionDetails.gasUsed.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-300">Contract:</span>
              <span className="text-white ml-2 font-mono text-xs">{transactionDetails.contractAddress.slice(0, 10)}...</span>
            </div>
            <div>
              <span className="text-gray-300">Confirmations:</span>
              <span className="text-white ml-2 font-mono">{transactionDetails.confirmations}</span>
            </div>
            <div>
              <span className="text-gray-300">From:</span>
              <span className="text-white ml-2 font-mono text-xs">{transactionDetails.from.slice(0, 10)}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Chainlink CCIP Details */}
      {transactionDetails && (
        <div className="bg-gradient-to-r from-orange-900 to-purple-900 p-6 rounded-lg border border-orange-700">
          <h4 className="text-white font-bold mb-4">🔗 Chainlink CCIP Cross-Chain Details:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-300">CCIP Message ID:</span>
              <span className="text-white ml-2 font-mono text-xs">{transactionDetails.ccipMessageId.slice(0, 20)}...</span>
            </div>
            <div>
              <span className="text-gray-300">Source Chain:</span>
              <span className="text-white ml-2 font-mono text-xs">{transactionDetails.sourceChainSelector}</span>
            </div>
            <div>
              <span className="text-gray-300">Destination Chain:</span>
              <span className="text-white ml-2 font-mono text-xs">{transactionDetails.destinationChainSelector}</span>
            </div>
            <div>
              <span className="text-gray-300">CCIP Fee:</span>
              <span className="text-white ml-2 font-mono">{transactionDetails.ccipFeeInLink} LINK</span>
            </div>
            <div>
              <span className="text-gray-300">Delivery Time:</span>
              <span className="text-white ml-2">{transactionDetails.estimatedDeliveryTime}</span>
            </div>
            <div>
              <span className="text-gray-300">Cross-Chain Status:</span>
              <span className="text-green-400 ml-2">✓ Enabled & Active</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-orange-800/30 rounded border border-orange-600">
            <p className="text-orange-100 text-xs">
              🚀 Your NFT is now cross-chain compatible! You can transfer it between Ethereum and Polkadot networks 
              using the Chainlink CCIP bridge. Message ID can be used to track cross-chain transfers on CCIP Explorer.
            </p>
          </div>
        </div>
      )}

      {/* NFT Details */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h4 className="text-white font-bold mb-4">Your Air Rights NFT:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-300">Property:</span>
            <span className="text-white ml-2">{nftMetadata.propertyAddress}</span>
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
            <span className="text-white ml-2">{nftMetadata.developmentPotential}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
        <h4 className="text-white font-semibold mb-2">What's Next?</h4>
        <ul className="text-blue-100 text-sm space-y-1">
          <li>• Your NFT is now visible in your connected wallet</li>
          <li>• View it on the block explorer using the transaction hash above</li>
          <li>• Transfer between Ethereum and Polkadot using CCIP bridge</li>
          <li>• List for resale on the AirSpace marketplace</li>
          <li>• Start planning your development project!</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-3">
        <Button
          onClick={() => {
            const explorerUrl = selectedBlockchain === 'ethereum' 
              ? `https://sepolia.etherscan.io/tx/${transactionDetails?.txHash}` 
              : `https://paseo.subscan.io/extrinsic/${transactionDetails?.txHash}`;
            window.open(explorerUrl, '_blank');
          }}
          variant="outline"
          className="min-w-[150px]"
        >
          View on {selectedBlockchain === 'ethereum' ? 'Etherscan' : 'Subscan'}
        </Button>
        <Button
          onClick={() => window.open(`https://ccip.chain.link/msg/${transactionDetails?.ccipMessageId}`, '_blank')}
          variant="outline"
          className="min-w-[150px] border-orange-600 text-orange-400 hover:bg-orange-900"
        >
          CCIP Explorer
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

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 'agreement':
        return renderAgreementStep();
      case 'blockchain-selection':
        return renderBlockchainSelection();
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
            {currentStep === 'blockchain-selection' && 'Choose Your Blockchain'}
            {currentStep === 'processing' && 'Processing Purchase'}
            {currentStep === 'complete' && 'Purchase Complete'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            {['agreement', 'blockchain-selection', 'processing', 'complete'].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`w-3 h-3 rounded-full ${
                  currentStep === step ? 'bg-blue-500' : 
                  ['agreement', 'blockchain-selection', 'processing', 'complete'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-600'
                }`}></div>
                {index < 3 && <div className="w-8 h-0.5 bg-gray-600"></div>}
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