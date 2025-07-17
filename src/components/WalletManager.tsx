import React from 'react';
import { useMetaMask } from '@/context/MetaMaskContext';
import { Button } from '@/components/SharedComponent/Button';
import { toast } from 'react-hot-toast';

interface WalletManagerProps {
  className?: string;
  showAccountInfo?: boolean;
}

const WalletManager: React.FC<WalletManagerProps> = ({ 
  className = "", 
  showAccountInfo = true 
}) => {
  const { user, connectWallet, disconnectWallet, isLoading } = useMetaMask();

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast.success('Wallet disconnected successfully!');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleSwitchAccount = async () => {
    try {
      // First disconnect
      await disconnectWallet();
      
      // Small delay to ensure disconnection is complete
      setTimeout(async () => {
        try {
          // Request account selection from MetaMask
          await window.ethereum?.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
          
          // Then reconnect with new account
          await connectWallet();
          toast.success('Switched to new account successfully!');
        } catch (error) {
          console.error('Error switching account:', error);
          toast.error('Failed to switch account. Please connect manually.');
        }
      }, 500);
    } catch (error) {
      console.error('Error switching account:', error);
      toast.error('Failed to switch account');
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!user.isConnected) {
    return (
      <div className={`${className}`}>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Wallet Not Connected
              </h3>
              <div className="mt-2">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Connect your MetaMask wallet to purchase Air Rights NFTs.
                </p>
              </div>
              <div className="mt-3">
                <Button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {isLoading ? 'Connecting...' : 'Connect MetaMask'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Wallet Connected
              </h3>
              {showAccountInfo && (
                <div className="mt-1">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <span className="font-mono">{truncateAddress(user.address!)}</span>
                  </p>
                  {user.balance && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Balance: {user.balance} AVAX
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSwitchAccount}
              disabled={isLoading}
              variant="outline"
              className="text-sm border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Switch Account
            </Button>
            <Button
              onClick={handleDisconnect}
              disabled={isLoading}
              variant="outline"
              className="text-sm border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletManager; 