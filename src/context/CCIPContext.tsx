"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { useMetaMask, SUPPORTED_NETWORKS, SupportedNetwork } from './MetaMaskContext';

// CCIP Chain Selectors (from Chainlink documentation)
export const CCIP_CHAIN_SELECTORS = {
  ETHEREUM_SEPOLIA: '16015286601757825753',
  AVALANCHE_FUJI: '14767482510784806043',
  // Note: Polkadot support will be added when CCIP supports it
  // For now, we'll use Avalanche Fuji as a proxy for demonstration
} as const;

// Contract addresses (these would be deployed contracts)
export const CONTRACT_ADDRESSES = {
  ETHEREUM_SEPOLIA: {
    CCIP_SENDER: '', // To be deployed
    CCIP_RECEIVER: '', // To be deployed
    NFT_CONTRACT: '', // Existing AirSpace NFT contract
  },
  AVALANCHE_FUJI: {
    CCIP_SENDER: '', // To be deployed
    CCIP_RECEIVER: '', // To be deployed  
    NFT_CONTRACT: '', // Polkadot-compatible NFT contract
  },
} as const;

// NFT Data structure
export interface NFTData {
  nftContract: string;
  tokenId: string;
  originalOwner: string;
  propertyAddress: string;
  currentHeight: string;
  maximumHeight: string;
  availableFloors: string;
  price: string;
  metadataURI: string;
}

// Cross-chain transfer status
export interface CrossChainTransfer {
  id: string;
  messageId?: string;
  sourceChain: SupportedNetwork;
  destinationChain: SupportedNetwork;
  nftData: NFTData;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  txHash?: string;
  timestamp: number;
  paymentToken?: string;
  paymentAmount?: string;
}

// CCIP Context interface
interface CCIPContextType {
  transfers: CrossChainTransfer[];
  isLoading: boolean;
  error: Error | null;
  
  // Transfer functions
  sendNFTData: (
    destinationChain: SupportedNetwork,
    nftData: NFTData,
    paymentToken?: string,
    paymentAmount?: string
  ) => Promise<string | null>;
  
  // Fee estimation
  estimateFees: (
    destinationChain: SupportedNetwork,
    nftData: NFTData
  ) => Promise<string | null>;
  
  // Status checking
  checkTransferStatus: (messageId: string) => Promise<void>;
  
  // History management
  getTransferHistory: () => CrossChainTransfer[];
  clearTransferHistory: () => void;
}

// Create context
const CCIPContext = createContext<CCIPContextType>({
  transfers: [],
  isLoading: false,
  error: null,
  sendNFTData: async () => null,
  estimateFees: async () => null,
  checkTransferStatus: async () => {},
  getTransferHistory: () => [],
  clearTransferHistory: () => {},
});

// Hook to use context
export const useCCIP = () => useContext(CCIPContext);

// Provider props
interface CCIPProviderProps {
  children: ReactNode;
}

// Provider component
export const CCIPProvider: React.FC<CCIPProviderProps> = ({ children }) => {
  const { user, switchNetwork, getCurrentNetwork } = useMetaMask();
  const [transfers, setTransfers] = useState<CrossChainTransfer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Get contract address for current network
  const getContractAddress = (network: SupportedNetwork, contractType: 'CCIP_SENDER' | 'CCIP_RECEIVER' | 'NFT_CONTRACT'): string => {
    switch (network) {
      case 'ETHEREUM_SEPOLIA':
        return CONTRACT_ADDRESSES.ETHEREUM_SEPOLIA[contractType];
      case 'AVALANCHE_FUJI':
        return CONTRACT_ADDRESSES.AVALANCHE_FUJI[contractType];
      default:
        return '';
    }
  };

  // Get CCIP chain selector
  const getChainSelector = (network: SupportedNetwork): string => {
    switch (network) {
      case 'ETHEREUM_SEPOLIA':
        return CCIP_CHAIN_SELECTORS.ETHEREUM_SEPOLIA;
      case 'AVALANCHE_FUJI':
        return CCIP_CHAIN_SELECTORS.AVALANCHE_FUJI;
      default:
        return '';
    }
  };

  // Create contract interface for CCIP sender
  const createSenderContract = (contractAddress: string) => {
    if (!window.ethereum) throw new Error('MetaMask not available');
    
    // This would normally use ethers.js or web3.js
    // For now, we'll simulate the contract interface
    return {
      async sendNFTData(
        destinationChainSelector: string,
        receiver: string,
        nftData: NFTData
      ): Promise<string> {
        // Encode the contract call
        const data = window.ethereum!.request({
          method: 'eth_sendTransaction',
          params: [{
            to: contractAddress,
            data: `0x${this.encodeCall('sendNFTData', [
              destinationChainSelector,
              receiver,
              nftData
            ])}`,
          }],
        });
        return data;
      },

      async sendNFTDataWithPayment(
        destinationChainSelector: string,
        receiver: string,
        nftData: NFTData,
        paymentToken: string,
        paymentAmount: string
      ): Promise<string> {
        const data = window.ethereum!.request({
          method: 'eth_sendTransaction',
          params: [{
            to: contractAddress,
            data: `0x${this.encodeCall('sendNFTDataWithPayment', [
              destinationChainSelector,
              receiver,
              nftData,
              paymentToken,
              paymentAmount
            ])}`,
            value: paymentToken === '0x0000000000000000000000000000000000000000' ? paymentAmount : '0x0',
          }],
        });
        return data;
      },

      async getFee(
        destinationChainSelector: string,
        nftData: NFTData
      ): Promise<string> {
        // This would call the contract's getFee function
        // For demo purposes, return a simulated fee
        return '1000000000000000000'; // 1 LINK token in wei
      },

      encodeCall(method: string, params: any[]): string {
        // This would encode the contract call using ABI
        // For demo, return a placeholder
        return '0123456789abcdef';
      }
    };
  };

  // Estimate cross-chain fees
  const estimateFees = useCallback(async (
    destinationChain: SupportedNetwork,
    nftData: NFTData
  ): Promise<string | null> => {
    if (!user.isConnected) {
      setError(new Error('Wallet not connected'));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentNetwork = getCurrentNetwork();
      if (!currentNetwork) {
        throw new Error('Unable to determine current network');
      }

      const senderAddress = getContractAddress(currentNetwork, 'CCIP_SENDER');
      if (!senderAddress) {
        throw new Error(`CCIP sender contract not available on ${currentNetwork}`);
      }

      const destinationChainSelector = getChainSelector(destinationChain);
      const senderContract = createSenderContract(senderAddress);
      
      const fee = await senderContract.getFee(destinationChainSelector, nftData);
      return fee;

    } catch (error: any) {
      console.error('Error estimating fees:', error);
      setError(error);
      toast.error(`Failed to estimate fees: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user.isConnected, getCurrentNetwork]);

  // Send NFT data cross-chain
  const sendNFTData = useCallback(async (
    destinationChain: SupportedNetwork,
    nftData: NFTData,
    paymentToken?: string,
    paymentAmount?: string
  ): Promise<string | null> => {
    if (!user.isConnected) {
      setError(new Error('Wallet not connected'));
      toast.error('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentNetwork = getCurrentNetwork();
      if (!currentNetwork) {
        throw new Error('Unable to determine current network');
      }

      if (currentNetwork === destinationChain) {
        throw new Error('Source and destination chains cannot be the same');
      }

      // Get contract addresses
      const senderAddress = getContractAddress(currentNetwork, 'CCIP_SENDER');
      const receiverAddress = getContractAddress(destinationChain, 'CCIP_RECEIVER');
      
      if (!senderAddress || !receiverAddress) {
        throw new Error('Required contracts not deployed on selected chains');
      }

      const destinationChainSelector = getChainSelector(destinationChain);
      const senderContract = createSenderContract(senderAddress);

      // Create transfer record
      const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transfer: CrossChainTransfer = {
        id: transferId,
        sourceChain: currentNetwork,
        destinationChain,
        nftData,
        status: 'pending',
        timestamp: Date.now(),
        paymentToken,
        paymentAmount,
      };

      setTransfers(prev => [...prev, transfer]);

      // Send transaction
      let txHash: string;
      if (paymentToken && paymentAmount) {
        txHash = await senderContract.sendNFTDataWithPayment(
          destinationChainSelector,
          receiverAddress,
          nftData,
          paymentToken,
          paymentAmount
        );
      } else {
        txHash = await senderContract.sendNFTData(
          destinationChainSelector,
          receiverAddress,
          nftData
        );
      }

      // Update transfer with transaction hash
      setTransfers(prev => prev.map(t => 
        t.id === transferId 
          ? { ...t, txHash, status: 'sent' }
          : t
      ));

      toast.success('Cross-chain transfer initiated!');
      toast('Check CCIP Explorer for status', { icon: 'ℹ️' });

      return txHash;

    } catch (error: any) {
      console.error('Error sending NFT data:', error);
      setError(error);
      toast.error(`Failed to send NFT data: ${error.message}`);
      
      // Update transfer status to failed
      setTransfers(prev => prev.map(t => 
        t.status === 'pending' 
          ? { ...t, status: 'failed' }
          : t
      ));
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user.isConnected, getCurrentNetwork]);

  // Check transfer status (would normally query CCIP Explorer or contract events)
  const checkTransferStatus = useCallback(async (messageId: string): Promise<void> => {
    try {
      // This would normally query the CCIP Explorer API or contract events
      // For demo purposes, simulate status check
      
      setTransfers(prev => prev.map(t => 
        t.messageId === messageId 
          ? { ...t, status: 'delivered' }
          : t
      ));

      toast.success('Transfer status updated!');
    } catch (error: any) {
      console.error('Error checking transfer status:', error);
      toast.error('Failed to check transfer status');
    }
  }, []);

  // Get transfer history
  const getTransferHistory = useCallback((): CrossChainTransfer[] => {
    return transfers.sort((a, b) => b.timestamp - a.timestamp);
  }, [transfers]);

  // Clear transfer history
  const clearTransferHistory = useCallback((): void => {
    setTransfers([]);
    toast.success('Transfer history cleared');
  }, []);

  // Load transfer history from localStorage on mount
  React.useEffect(() => {
    const savedTransfers = localStorage.getItem('ccip_transfers');
    if (savedTransfers) {
      try {
        const parsed = JSON.parse(savedTransfers);
        setTransfers(parsed);
      } catch (error) {
        console.error('Error loading transfer history:', error);
      }
    }
  }, []);

  // Save transfer history to localStorage
  React.useEffect(() => {
    if (transfers.length > 0) {
      localStorage.setItem('ccip_transfers', JSON.stringify(transfers));
    }
  }, [transfers]);

  const value: CCIPContextType = {
    transfers,
    isLoading,
    error,
    sendNFTData,
    estimateFees,
    checkTransferStatus,
    getTransferHistory,
    clearTransferHistory,
  };

  return (
    <CCIPContext.Provider value={value}>
      {children}
    </CCIPContext.Provider>
  );
}; 