"use client";

import React, { useState, useEffect } from 'react';
import { useMetaMask } from '@/context/MetaMaskContext';
import { useCivicAuth } from '@/context/CivicAuthContext';
import { CivicAuthButton } from '@/components/Auth/CivicAuthButton';
import { toast } from "react-hot-toast";

// MetaMask Logo Component
const MetaMaskLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 318.6 318.6"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <style>{`
        .cls-1{fill:#e2761b;stroke:#e2761b;stroke-linecap:round;stroke-linejoin:round;}
        .cls-2{fill:#e4761b;stroke:#e4761b;stroke-linecap:round;stroke-linejoin:round;}
        .cls-3{fill:#d7c1b3;stroke:#d7c1b3;stroke-linecap:round;stroke-linejoin:round;}
        .cls-4{fill:#233447;stroke:#233447;stroke-linecap:round;stroke-linejoin:round;}
        .cls-5{fill:#cd6116;stroke:#cd6116;stroke-linecap:round;stroke-linejoin:round;}
        .cls-6{fill:#e4751f;stroke:#e4751f;stroke-linecap:round;stroke-linejoin:round;}
        .cls-7{fill:#f6851b;stroke:#f6851b;stroke-linecap:round;stroke-linejoin:round;}
        .cls-8{fill:#c0ad9e;stroke:#c0ad9e;stroke-linecap:round;stroke-linejoin:round;}
        .cls-9{fill:#161616;stroke:#161616;stroke-linecap:round;stroke-linejoin:round;}
        .cls-10{fill:#763d16;stroke:#763d16;stroke-linecap:round;stroke-linejoin:round;}
      `}</style>
    </defs>
    <polygon className="cls-1" points="274.1,35.5 174.6,109.4 193,65.8 274.1,35.5"/>
    <polygon className="cls-2" points="44.4,35.5 143.1,110.1 125.6,65.8 44.4,35.5"/>
    <polygon className="cls-2" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7 238.3,206.8"/>
    <polygon className="cls-2" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8 33.9,207.7"/>
    <polygon className="cls-2" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1 103.6,138.2"/>
    <polygon className="cls-2" points="214.9,138.2 175.9,103.4 174.6,164.6 230.8,162.1 214.9,138.2"/>
    <polygon className="cls-2" points="106.8,247.4 140.6,230.9 111.4,208.1 106.8,247.4"/>
    <polygon className="cls-2" points="177.9,230.9 211.8,247.4 207.1,208.1 177.9,230.9"/>
    <polygon className="cls-1" points="211.8,247.4 177.9,230.9 180.6,253 180.3,262.3 211.8,247.4"/>
    <polygon className="cls-1" points="106.8,247.4 138.3,262.3 138.1,253 140.6,230.9 106.8,247.4"/>
    <polygon className="cls-3" points="138.8,193.5 110.6,185.2 130.5,176.1 138.8,193.5"/>
    <polygon className="cls-3" points="179.7,193.5 188,176.1 208,185.2 179.7,193.5"/>
    <polygon className="cls-4" points="106.8,247.4 111.6,206.8 80.3,207.7 106.8,247.4"/>
    <polygon className="cls-4" points="207,206.8 211.8,247.4 238.3,207.7 207,206.8"/>
    <polygon className="cls-4" points="230.8,162.1 174.6,164.6 179.8,193.5 188.1,176.1 208.1,185.2 230.8,162.1"/>
    <polygon className="cls-4" points="110.6,185.2 130.6,176.1 138.9,193.5 144.1,164.6 87.8,162.1 110.6,185.2"/>
    <polygon className="cls-5" points="87.8,162.1 111.4,208.1 110.6,185.2 87.8,162.1"/>
    <polygon className="cls-5" points="208.1,185.2 207.1,208.1 230.8,162.1 208.1,185.2"/>
    <polygon className="cls-5" points="144.1,164.6 138.9,193.5 145.4,227.6 146.9,182.7 144.1,164.6"/>
    <polygon className="cls-5" points="174.6,164.6 171.9,182.6 173.1,227.6 179.8,193.5 174.6,164.6"/>
    <polygon className="cls-6" points="179.8,193.5 173.1,227.6 177.9,230.9 207.1,208.1 208.1,185.2 179.8,193.5"/>
    <polygon className="cls-6" points="110.6,185.2 111.4,208.1 140.6,230.9 145.4,227.6 138.9,193.5 110.6,185.2"/>
    <polygon className="cls-7" points="180.3,262.3 180.6,253 178.1,250.8 140.4,250.8 138.1,253 138.3,262.3 106.8,247.4 117.8,256.4 140.1,271.9 178.4,271.9 200.8,256.4 211.8,247.4 180.3,262.3"/>
    <polygon className="cls-8" points="177.9,230.9 173.1,227.6 145.4,227.6 140.6,230.9 138.1,253 140.4,250.8 178.1,250.8 180.6,253 177.9,230.9"/>
    <polygon className="cls-9" points="278.3,114.2 286.8,73.4 274.1,35.5 177.9,106.9 214.9,138.2 267.2,153.5 278.8,140 273.8,136.4 281.8,129.1 275.6,124.3 283.6,118.2 278.3,114.2"/>
    <polygon className="cls-9" points="31.8,73.4 40.3,114.2 34.9,118.2 42.9,124.3 36.8,129.1 44.8,136.4 39.8,140 51.3,153.5 103.6,138.2 140.6,106.9 44.4,35.5 31.8,73.4"/>
    <polygon className="cls-10" points="267.2,153.5 214.9,138.2 230.8,162.1 207.1,208.1 238.3,207.7 284.8,207.7 267.2,153.5"/>
    <polygon className="cls-10" points="103.6,138.2 51.3,153.5 33.9,207.7 80.3,207.7 111.4,208.1 87.8,162.1 103.6,138.2"/>
    <polygon className="cls-10" points="174.6,164.6 177.9,106.9 193,65.8 125.6,65.8 140.6,106.9 144.1,164.6 145.3,182.8 145.4,227.6 173.1,227.6 173.3,182.8 174.6,164.6"/>
  </svg>
);

// Interface for props
interface AuthButtonsProps {
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

export const AuthButtons = () => {
  const { 
    user, 
    connectWallet, 
    disconnectWallet, 
    isLoading: metaMaskLoading,
    switchNetwork 
  } = useMetaMask();
  
  const { 
    isConnected: isCivicConnected, 
    connectWithCivic, 
    disconnectWallet: disconnectCivic, 
    isConnecting: civicLoading,
    user: civicUser 
  } = useCivicAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState<string>('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  // Get current network name
  const getCurrentNetwork = (): string => {
    if (!user.chainId) return 'Unknown';
    
    const chainId = user.chainId.toLowerCase();
    switch (chainId) {
      case '0xaa36a7': // 11155111 (Sepolia)
        return 'Ethereum Sepolia';
      case '0xa869': // 43113 (Fuji)
        return 'Avalanche Fuji';
      case '0x96d': // Polkadot Paseo (case insensitive)
        return 'Polkadot Paseo';
      default:
        // Handle decimal chainIds as well
        const decimalChainId = parseInt(chainId, 16).toString();
        switch (decimalChainId) {
          case '11155111':
            return 'Ethereum Sepolia';
          case '43113':
            return 'Avalanche Fuji';
          case '2397': // Polkadot Paseo (decimal)
            return 'Polkadot Paseo';
          default:
            return `Chain ${user.chainId}`;
        }
    }
  };

  // Handle network switching
  const handleSwitchNetwork = async (network: 'ETHEREUM_SEPOLIA' | 'POLKADOT_PASEO' | 'AVALANCHE_FUJI') => {
    try {
      await switchNetwork(network);
      setActiveNetwork(network);
      setIsDropdownOpen(false);
      
      const networkName = network === 'ETHEREUM_SEPOLIA' ? 'Ethereum Sepolia' : 
                          network === 'POLKADOT_PASEO' ? 'Polkadot Paseo' : 'Avalanche Fuji';
      toast.success(`Switched to ${networkName}`);
    } catch (error) {
      console.error('Network switch failed:', error);
      toast.error('Failed to switch network');
    }
  };

  // Handle account switching
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
          setIsDropdownOpen(false);
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

  // Truncate address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Loading state for both MetaMask and Civic
  if (metaMaskLoading || civicLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        <span className="text-sm text-gray-600 dark:text-gray-300">Connecting...</span>
      </div>
    );
  }

  // If both are connected (premium user experience)
  if (user.isConnected && isCivicConnected) {
    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">
                {civicUser?.name || civicUser?.email || 'Verified User'}
              </div>
              <div className="text-xs opacity-90">
                {truncateAddress(user.address!)} • {getCurrentNetwork()}
              </div>
            </div>
          </div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {(civicUser?.name || civicUser?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {civicUser?.name || civicUser?.email || 'Verified User'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Premium Account
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Wallet:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{truncateAddress(user.address!)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Network:</span>
                  <span className="text-gray-900 dark:text-white">{getCurrentNetwork()}</span>
                </div>
                {user.balance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                    <span className="text-gray-900 dark:text-white">{user.balance}</span>
                  </div>
                )}
              </div>

              {/* Network Switch Options */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Switch Network:</div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => handleSwitchNetwork('AVALANCHE_FUJI')}
                    className="text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Avalanche Fuji
                  </button>
                  <button
                    onClick={() => handleSwitchNetwork('ETHEREUM_SEPOLIA')}
                    className="text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Ethereum Sepolia
                  </button>
                </div>
              </div>

              {/* Account Management */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Management:</div>
                <button
                  onClick={handleSwitchAccount}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Switch MetaMask Account
                </button>
              </div>
            </div>

            <hr className="my-1 border-gray-200 dark:border-gray-600" />
            
            <button
              onClick={disconnectWallet}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect MetaMask
            </button>
          </div>
        )}
      </div>
    );
  }

  // If only MetaMask is connected
  if (user.isConnected && !isCivicConnected) {
    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">MetaMask Connected</div>
              <div className="text-xs opacity-90">
                {truncateAddress(user.address!)} • {getCurrentNetwork()}
              </div>
            </div>
          </div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">MetaMask User</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Standard Account</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Wallet:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{truncateAddress(user.address!)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Network:</span>
                  <span className="text-gray-900 dark:text-white">{getCurrentNetwork()}</span>
                </div>
                {user.balance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                    <span className="text-gray-900 dark:text-white">{user.balance}</span>
                  </div>
                )}
              </div>

              {/* Network Switch Options */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Switch Network:</div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => handleSwitchNetwork('AVALANCHE_FUJI')}
                    className="text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Avalanche Fuji
                  </button>
                  <button
                    onClick={() => handleSwitchNetwork('ETHEREUM_SEPOLIA')}
                    className="text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Ethereum Sepolia
                  </button>
                </div>
              </div>

              {/* Account Management */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Management:</div>
                <button
                  onClick={handleSwitchAccount}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Switch MetaMask Account
                </button>
              </div>

              {/* Civic Auth Upgrade */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Upgrade to Premium
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  Connect with Civic for enhanced security and features
                </div>
                <button
                  onClick={connectWithCivic}
                  className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Connect Civic Auth
                </button>
              </div>
            </div>

            <hr className="my-1 border-gray-200 dark:border-gray-600" />
            
            <button
              onClick={disconnectWallet}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  // If only Civic is connected
  if (!user.isConnected && isCivicConnected) {
    return (
      <div className="flex items-center gap-4">
        <CivicAuthButton 
          variant="outline" 
          size="sm" 
          showUserButton={true}
        />
        
        <button
          onClick={async () => {
            try {
              await connectWallet();
            } catch (error) {
              console.error('Failed to connect MetaMask:', error);
            }
          }}
          disabled={metaMaskLoading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105 active:scale-95"
        >
          {metaMaskLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <MetaMaskLogo className="w-4 h-4" />
              <span>Connect MetaMask</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // If neither is connected
  return (
    <div className="flex items-center gap-4">
      <CivicAuthButton 
        variant="outline" 
        size="sm"
        showUserButton={false}
      />
      
      <button
        onClick={async () => {
          try {
            await connectWallet();
          } catch (error) {
            console.error('Failed to connect MetaMask:', error);
          }
        }}
        disabled={metaMaskLoading}
        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105 active:scale-95"
      >
        {metaMaskLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <MetaMaskLogo className="w-4 h-4" />
            <span>Connect MetaMask</span>
          </>
        )}
      </button>
    </div>
  );
}; 