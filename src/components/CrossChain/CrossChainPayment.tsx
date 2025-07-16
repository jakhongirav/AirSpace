"use client";

import React, { useState, useEffect } from 'react';
import { useMetaMask } from '@/context/MetaMaskContext';
import { useCCIP, NFTData } from '@/context/CCIPContext';
import { toast } from 'react-hot-toast';

interface CrossChainPaymentProps {
  nftData: {
    propertyAddress: string;
    currentHeight: number;
    maximumHeight: number;
    price: number;
    metadataURI?: string;
  };
  onPaymentSuccess?: (txHash: string) => void;
  onPaymentError?: (error: Error) => void;
}

const CrossChainPayment: React.FC<CrossChainPaymentProps> = ({
  nftData,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const { user, switchNetwork, getCurrentNetwork } = useMetaMask();
  const { sendNFTData, estimateFees, isLoading } = useCCIP();
  
  const [selectedPaymentChain, setSelectedPaymentChain] = useState<'ETHEREUM_SEPOLIA' | 'AVALANCHE_FUJI'>('ETHEREUM_SEPOLIA');
  const [estimatedFees, setEstimatedFees] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  // Convert nftData to CCIP format
  const convertToNFTData = (): NFTData => ({
    nftContract: '0x0000000000000000000000000000000000000000', // Placeholder
    tokenId: '0',
    originalOwner: user.address || '0x0000000000000000000000000000000000000000',
    propertyAddress: nftData.propertyAddress,
    currentHeight: nftData.currentHeight.toString(),
    maximumHeight: nftData.maximumHeight.toString(),
    availableFloors: (nftData.maximumHeight - nftData.currentHeight).toString(),
    price: (nftData.price * 1e18).toString(), // Convert to wei
    metadataURI: nftData.metadataURI || '',
  });

  // Estimate fees when component mounts or payment chain changes
  useEffect(() => {
    const estimateTransferFees = async () => {
      if (!user.isConnected) return;

      setIsEstimating(true);
      try {
        const nftDataFormatted = convertToNFTData();
        const targetChain = selectedPaymentChain === 'ETHEREUM_SEPOLIA' ? 'AVALANCHE_FUJI' : 'ETHEREUM_SEPOLIA';
        const fees = await estimateFees(targetChain, nftDataFormatted);
        setEstimatedFees(fees);
      } catch (error) {
        console.error('Error estimating fees:', error);
      } finally {
        setIsEstimating(false);
      }
    };

    estimateTransferFees();
  }, [selectedPaymentChain, user.isConnected, estimateFees]);

  // Handle payment with cross-chain transfer
  const handleCrossChainPayment = async () => {
    if (!user.isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Switch to payment chain if needed
      const currentNetwork = getCurrentNetwork();
      if (currentNetwork !== selectedPaymentChain) {
        await switchNetwork(selectedPaymentChain);
      }

      // Prepare NFT data
      const nftDataFormatted = convertToNFTData();
      const targetChain = selectedPaymentChain === 'ETHEREUM_SEPOLIA' ? 'AVALANCHE_FUJI' : 'ETHEREUM_SEPOLIA';
      
      // Determine payment token (native token for simplicity)
      const paymentToken = '0x0000000000000000000000000000000000000000'; // Native token
      const paymentAmount = (nftData.price * 1e18).toString(); // Convert to wei

      // Send cross-chain payment
      const txHash = await sendNFTData(
        targetChain,
        nftDataFormatted,
        paymentToken,
        paymentAmount
      );

      if (txHash) {
        toast.success('Cross-chain payment initiated!');
        onPaymentSuccess?.(txHash);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Cross-chain payment error:', error);
      toast.error(`Payment failed: ${error.message}`);
      onPaymentError?.(error);
    }
  };

  // Handle direct payment (same chain)
  const handleDirectPayment = async () => {
    if (!user.isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Switch to payment chain if needed
      const currentNetwork = getCurrentNetwork();
      if (currentNetwork !== selectedPaymentChain) {
        await switchNetwork(selectedPaymentChain);
      }

      // Simulate direct payment transaction
      const txData = {
        to: '0x0000000000000000000000000000000000000000', // Contract address
        value: `0x${(nftData.price * 1e18).toString(16)}`, // Convert to hex wei
      };

      const txHash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [txData],
      });

      toast.success('Direct payment successful!');
      onPaymentSuccess?.(txHash);
    } catch (error: any) {
      console.error('Direct payment error:', error);
      toast.error(`Payment failed: ${error.message}`);
      onPaymentError?.(error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(4)} ${currency}`;
  };

  const getNetworkCurrency = (network: string) => {
    switch (network) {
      case 'ETHEREUM_SEPOLIA':
        return 'SEP';
      case 'AVALANCHE_FUJI':
        return 'AVAX';
      default:
        return 'TOKEN';
    }
  };

  const formatFees = (fees: string | null) => {
    if (!fees) return 'Calculating...';
    const feesInEther = parseInt(fees, 16) / 1e18;
    return `~${feesInEther.toFixed(6)} LINK`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Payment Method</h3>
      
      {/* Property Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-800 mb-2">Property Details</h4>
        <p className="text-sm text-gray-600 mb-1">Address: {nftData.propertyAddress}</p>
        <p className="text-sm text-gray-600 mb-1">
          Height: {nftData.currentHeight}m / {nftData.maximumHeight}m
        </p>
        <p className="text-sm text-gray-600 mb-1">
          Available Floors: {nftData.maximumHeight - nftData.currentHeight}
        </p>
        <p className="text-lg font-bold text-green-600">
          Price: {formatPrice(nftData.price, 'ETH')}
        </p>
      </div>

      {/* Payment Chain Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Payment Chain
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentChain"
              value="ETHEREUM_SEPOLIA"
              checked={selectedPaymentChain === 'ETHEREUM_SEPOLIA'}
              onChange={(e) => setSelectedPaymentChain(e.target.value as any)}
              className="mr-2"
            />
            <span className="text-sm">
              Ethereum Sepolia ({formatPrice(nftData.price, getNetworkCurrency('ETHEREUM_SEPOLIA'))})
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentChain"
              value="AVALANCHE_FUJI"
              checked={selectedPaymentChain === 'AVALANCHE_FUJI'}
              onChange={(e) => setSelectedPaymentChain(e.target.value as any)}
              className="mr-2"
            />
            <span className="text-sm">
              Avalanche Fuji ({formatPrice(nftData.price, getNetworkCurrency('AVALANCHE_FUJI'))})
            </span>
          </label>
        </div>
      </div>

      {/* Cross-chain Fee Info */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">Cross-Chain Transfer</h4>
        <p className="text-xs text-blue-600 mb-2">
          Pay from {selectedPaymentChain.replace('_', ' ')} and receive NFT on the other chain
        </p>
        <p className="text-sm text-blue-700">
          Estimated CCIP Fees: {isEstimating ? 'Calculating...' : formatFees(estimatedFees)}
        </p>
      </div>

      {/* Payment Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleCrossChainPayment}
          disabled={isLoading || !user.isConnected}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
          )}
          Pay Cross-Chain with CCIP
        </button>

        <button
          onClick={handleDirectPayment}
          disabled={isLoading || !user.isConnected}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Pay Direct on {selectedPaymentChain.replace('_', ' ')}
        </button>
      </div>

      {/* Wallet Connection Prompt */}
      {!user.isConnected && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please connect your MetaMask wallet to proceed with payment.
          </p>
        </div>
      )}

      {/* Network Mismatch Warning */}
      {user.isConnected && getCurrentNetwork() !== selectedPaymentChain && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            You'll be prompted to switch to {selectedPaymentChain.replace('_', ' ')} network.
          </p>
        </div>
      )}
    </div>
  );
};

export default CrossChainPayment; 