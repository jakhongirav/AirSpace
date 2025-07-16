"use client";

import React from 'react';
import { useMetaMask } from '@/context/MetaMaskContext';
import { useCivicAuth } from '@/context/CivicAuthContext';
import { CivicAuthButton } from '@/components/Auth/CivicAuthButton';

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

// Format address for display
const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format balance for display
const formatBalance = (balance: string | null): string => {
  if (!balance) return '0.0000';
  return balance;
};

// Get network display name
const getNetworkDisplayName = (chainId: string | null): string => {
  if (!chainId) return 'Unknown';
  
  // Normalize chainId to lowercase for comparison
  const normalizedChainId = chainId.toLowerCase();
  
  switch (normalizedChainId) {
    case '0xaa36a7': // Ethereum Sepolia
      return 'Sepolia';
    case '0x96d': // Polkadot Paseo (case insensitive)
      return 'Paseo';
    case '0xa869': // Avalanche Fuji
      return 'Fuji';
    // Add decimal equivalents as backup
    case '11155111': // Ethereum Sepolia (decimal)
      return 'Sepolia';
    case '2397': // Polkadot Paseo (decimal)
      return 'Paseo';
    case '43113': // Avalanche Fuji (decimal)
      return 'Fuji';
    default:
      return 'Unknown';
  }
};

interface AuthButtonsProps {
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

const AuthButtons = ({ onSignInClick, onSignUpClick }: AuthButtonsProps) => {
  const { 
    user, 
    isLoading, 
    connectWallet, 
    disconnectWallet, 
    switchNetwork,
    getCurrentNetwork,
    refreshBalance 
  } = useMetaMask();

  const { 
    isConnected: isCivicConnected, 
    user: civicUser 
  } = useCivicAuth();

  const handleRefreshBalance = async () => {
    await refreshBalance();
  };

  const handleSwitchNetwork = async (network: 'ETHEREUM_SEPOLIA' | 'POLKADOT_PASEO' | 'AVALANCHE_FUJI') => {
    await switchNetwork(network);
  };

  const openExplorer = () => {
    const currentNetwork = getCurrentNetwork();
    let explorerUrl = '';
    
    switch (currentNetwork) {
      case 'ETHEREUM_SEPOLIA':
        explorerUrl = `https://sepolia.etherscan.io/address/${user.address}`;
        break;
      case 'POLKADOT_PASEO':
        explorerUrl = `https://paseo.subscan.io/account/${user.address}`;
        break;
      case 'AVALANCHE_FUJI':
        explorerUrl = `https://testnet.snowtrace.io/address/${user.address}`;
        break;
      default:
        return;
    }
    
    window.open(explorerUrl, '_blank');
  };

  // If both are connected, show both user interfaces
  if (user.isConnected && isCivicConnected) {
    return (
      <div className="flex items-center gap-4">
        {/* Civic User Button */}
        <CivicAuthButton 
          variant="outline" 
          size="sm" 
          showUserButton={true}
        />
        
        {/* MetaMask User Interface */}
        <div className="relative">
          <button
            className="flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => {
              // Toggle dropdown menu
            }}
          >
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <MetaMaskLogo className="w-4 h-4" />
            </div>
            
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatAddress(user.address!)}
                </span>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                  {getNetworkDisplayName(user.chainId)}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatBalance(user.balance)} {getCurrentNetwork()?.includes('ETHEREUM') ? 'SEP' : getCurrentNetwork()?.includes('AVALANCHE') ? 'AVAX' : 'PAS'}
              </span>
            </div>
            
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* MetaMask dropdown menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black dark:ring-gray-600 ring-opacity-5 dark:ring-opacity-50 focus:outline-none z-50 hidden group-hover:block">
            <div className="py-1">
              <button
                onClick={openExplorer}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Explorer
              </button>
              
              <button
                onClick={handleRefreshBalance}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Balance
              </button>

              <hr className="my-1 border-gray-200 dark:border-gray-600" />
              
              <div className="px-4 py-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Switch Network</p>
                <div className="space-y-1">
                  <button 
                    onClick={() => handleSwitchNetwork('ETHEREUM_SEPOLIA')}
                    className="w-full text-left text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-1"
                  >
                    Ethereum Sepolia
                  </button>
                  <button 
                    onClick={() => handleSwitchNetwork('AVALANCHE_FUJI')}
                    className="w-full text-left text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-1"
                  >
                    Avalanche Fuji
                  </button>
                  <button 
                    onClick={() => handleSwitchNetwork('POLKADOT_PASEO')}
                    className="w-full text-left text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-1"
                  >
                    Polkadot Paseo
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
          </div>
        </div>
      </div>
    );
  }

  // If only MetaMask is connected
  if (user.isConnected && !isCivicConnected) {
    return (
      <div className="flex items-center gap-4">
        {/* Option to connect Civic Auth */}
        <CivicAuthButton 
          variant="outline" 
          size="sm"
          showUserButton={false}
        />
        
        {/* MetaMask User Interface */}
        <div className="relative">
          <button
            className="flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => {
              // Toggle dropdown menu
            }}
          >
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <MetaMaskLogo className="w-4 h-4" />
            </div>
            
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatAddress(user.address!)}
                </span>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                  {getNetworkDisplayName(user.chainId)}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatBalance(user.balance)} {getCurrentNetwork()?.includes('ETHEREUM') ? 'SEP' : getCurrentNetwork()?.includes('AVALANCHE') ? 'AVAX' : 'PAS'}
              </span>
            </div>
            
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Simple dropdown menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black dark:ring-gray-600 ring-opacity-5 dark:ring-opacity-50 focus:outline-none z-50 hidden group-hover:block">
            <div className="py-1">
              <button
                onClick={openExplorer}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Explorer
              </button>
              
              <button
                onClick={handleRefreshBalance}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Balance
              </button>

              <hr className="my-1 border-gray-200 dark:border-gray-600" />
              
              <div className="px-4 py-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Switch Network</p>
                <div className="space-y-1">
                  <button 
                    onClick={() => handleSwitchNetwork('ETHEREUM_SEPOLIA')}
                    className="w-full text-left text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-1"
                  >
                    Ethereum Sepolia
                  </button>
                  <button 
                    onClick={() => handleSwitchNetwork('AVALANCHE_FUJI')}
                    className="w-full text-left text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-1"
                  >
                    Avalanche Fuji
                  </button>
                  <button 
                    onClick={() => handleSwitchNetwork('POLKADOT_PASEO')}
                    className="w-full text-left text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-1"
                  >
                    Polkadot Paseo
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
          </div>
        </div>
      </div>
    );
  }

  // If only Civic is connected
  if (!user.isConnected && isCivicConnected) {
    return (
      <div className="flex items-center gap-4">
        {/* Option to connect MetaMask */}
        <button
          onClick={async () => {
            try {
              await connectWallet();
            } catch (error) {
              console.error('Failed to connect MetaMask:', error);
            }
          }}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105 active:scale-95"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <MetaMaskLogo className="w-5 h-5" />
              <span>Connect MetaMask</span>
            </>
          )}
        </button>
        
        {/* Civic User Button */}
        <CivicAuthButton 
          variant="default" 
          size="default" 
          showUserButton={true}
        />
      </div>
    );
  }

  // If neither are connected, show both options
  return (
    <div className="flex items-center gap-4">
      <CivicAuthButton 
        variant="outline" 
        size="default"
        className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
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
        disabled={isLoading}
        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105 active:scale-95"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <MetaMaskLogo className="w-5 h-5" />
            <span>Connect MetaMask</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AuthButtons; 