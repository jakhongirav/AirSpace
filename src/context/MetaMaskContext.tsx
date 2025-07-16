"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

// Define supported networks
export const SUPPORTED_NETWORKS = {
  ETHEREUM_SEPOLIA: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Test Network',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'SEP',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
  POLKADOT_PASEO: {
    chainId: '0x96D', // 2397 in hex (Paseo testnet)
    chainName: 'Paseo Testnet',
    nativeCurrency: {
      name: 'PAS',
      symbol: 'PAS',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.ibp.network/paseo'],
    blockExplorerUrls: ['https://paseo.subscan.io/'],
  },
  AVALANCHE_FUJI: {
    chainId: '0xa869', // 43113 in hex
    chainName: 'Avalanche Fuji Testnet',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io/'],
  },
};

// Network type
export type SupportedNetwork = keyof typeof SUPPORTED_NETWORKS;

// User interface
interface MetaMaskUser {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  balance: string | null;
}

// Context interface
interface MetaMaskContextType {
  user: MetaMaskUser;
  isLoading: boolean;
  error: Error | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (network: SupportedNetwork) => Promise<void>;
  getCurrentNetwork: () => SupportedNetwork | null;
  isNetworkSupported: (chainId: string) => boolean;
  refreshBalance: () => Promise<void>;
}

// Create context
const MetaMaskContext = createContext<MetaMaskContextType>({
  user: { address: null, chainId: null, isConnected: false, balance: null },
  isLoading: false,
  error: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  switchNetwork: async () => {},
  getCurrentNetwork: () => null,
  isNetworkSupported: () => false,
  refreshBalance: async () => {},
});

// Hook to use context
export const useMetaMask = () => useContext(MetaMaskContext);

// Provider props
interface MetaMaskProviderProps {
  children: ReactNode;
}

// Check if MetaMask is installed
const isMetaMaskInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for MetaMask
  if (window.ethereum?.isMetaMask) return true;
  
  // Check for other MetaMask indicators
  return !!(window.ethereum && (
    window.ethereum.isMetaMask ||
    window.ethereum.providers?.some((provider: any) => provider.isMetaMask)
  ));
};

// Get MetaMask deeplink for mobile
const getMetaMaskDeepLink = (): string => {
  const currentUrl = window.location.href;
  return `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
};

// Detect if user is on mobile
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Provider component
export const MetaMaskProvider: React.FC<MetaMaskProviderProps> = ({ children }) => {
  const [user, setUser] = useState<MetaMaskUser>({
    address: null,
    chainId: null,
    isConnected: false,
    balance: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if chain ID is supported
  const isNetworkSupported = (chainId: string): boolean => {
    return Object.values(SUPPORTED_NETWORKS).some(network => network.chainId === chainId);
  };

  // Get current network name
  const getCurrentNetwork = (): SupportedNetwork | null => {
    if (!user.chainId) return null;
    
    for (const [key, network] of Object.entries(SUPPORTED_NETWORKS)) {
      if (network.chainId === user.chainId) {
        return key as SupportedNetwork;
      }
    }
    return null;
  };

  // Format balance for display
  const formatBalance = (balance: string): string => {
    const balanceNum = parseFloat(balance);
    if (balanceNum === 0) return '0.0000';
    if (balanceNum < 0.0001) return '<0.0001';
    return balanceNum.toFixed(4);
  };

  // Get balance
  const getBalance = async (address: string): Promise<string> => {
    if (!window.ethereum) throw new Error('MetaMask not found');
    
    try {
      const balance = await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      // Convert from wei to ether
      const balanceInEther = parseInt(balance, 16) / Math.pow(10, 18);
      return balanceInEther.toString();
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  // Refresh balance
  const refreshBalance = async (): Promise<void> => {
    if (!user.address) return;
    
    try {
      const balance = await getBalance(user.address);
      setUser(prev => ({ ...prev, balance: formatBalance(balance) }));
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  // Connect wallet
  const connectWallet = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (!isMetaMaskInstalled()) {
        // Handle mobile users with deeplink
        if (isMobile()) {
          const deepLink = getMetaMaskDeepLink();
          toast.error('MetaMask app not detected. Redirecting to MetaMask app...');
          window.open(deepLink, '_blank');
          return;
        }
        
        // Handle desktop users
        const error = new Error('MetaMask is not installed. Please install MetaMask to continue.');
        setError(error);
        toast.error('MetaMask is not installed. Please install MetaMask to continue.');
        
        // Redirect to MetaMask installation
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      // Ensure we have the right provider
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }

      // Request account access with better error handling
      let accounts: string[];
      try {
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
      } catch (requestError: any) {
        if (requestError.code === 4001) {
          throw new Error('Please connect to MetaMask and try again.');
        } else if (requestError.code === -32002) {
          throw new Error('Connection request already pending. Please check MetaMask.');
        }
        throw new Error(`Failed to connect: ${requestError.message}`);
      }

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in MetaMask.');
      }

      const address = accounts[0];

      // Get current chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      // Get balance
      const balance = await getBalance(address);

      // Update user state
      setUser({
        address,
        chainId,
        isConnected: true,
        balance: formatBalance(balance),
      });

      // Check if current network is supported
      if (!isNetworkSupported(chainId)) {
        toast.error('Current network is not supported. Please switch to a supported network.');
      } else {
        const networkName = getCurrentNetwork();
        toast.success(`✅ Connected to MetaMask on ${networkName || 'Unknown Network'}`);
      }

      // Store connection state
      localStorage.setItem('metamask_connected', 'true');
      localStorage.setItem('metamask_address', address);

    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      const errorMessage = error.message || 'Failed to connect to MetaMask';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async (): Promise<void> => {
    setUser({
      address: null,
      chainId: null,
      isConnected: false,
      balance: null,
    });
    setError(null);

    // Clear local storage
    localStorage.removeItem('metamask_connected');
    localStorage.removeItem('metamask_address');

    toast.success('Disconnected from MetaMask');
  };

  // Switch network
  const switchNetwork = async (network: SupportedNetwork): Promise<void> => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask is not installed');
      return;
    }

    if (!user.isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const networkConfig = SUPPORTED_NETWORKS[network];

      // Try to switch to the network
      try {
        await window.ethereum!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkConfig.chainId }],
        });
      } catch (switchError: any) {
        // Network doesn't exist in MetaMask, add it
        if (switchError.code === 4902) {
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
        } else {
          throw switchError;
        }
      }

      // Update chain ID in state
      setUser(prev => ({ ...prev, chainId: networkConfig.chainId }));
      
      // Refresh balance for new network
      await refreshBalance();

      toast.success(`Switched to ${networkConfig.chainName}`);

    } catch (error: any) {
      console.error('Error switching network:', error);
      const errorMessage = error.message || 'Failed to switch network';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (accounts[0] !== user.address) {
      setUser(prev => ({ ...prev, address: accounts[0] }));
      getBalance(accounts[0]).then(balance => {
        setUser(prev => ({ ...prev, balance: formatBalance(balance) }));
      });
      toast('Account changed', { icon: 'ℹ️' });
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainId: string) => {
    setUser(prev => ({ ...prev, chainId }));
    
    if (!isNetworkSupported(chainId)) {
      toast.error('Network not supported. Please switch to a supported network.');
    } else {
      const networkName = getCurrentNetwork();
      toast(`Network changed to ${networkName || 'Unknown Network'}`, { icon: 'ℹ️' });
    }
    
    // Refresh balance for new network
    refreshBalance();
  };

  // Set up event listeners
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    // Listen for account changes
    window.ethereum!.on('accountsChanged', handleAccountsChanged);
    
    // Listen for chain changes
    window.ethereum!.on('chainChanged', handleChainChanged);

    // Listen for disconnect
    window.ethereum!.on('disconnect', () => {
      disconnectWallet();
    });

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', disconnectWallet);
      }
    };
  }, [user.address]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const wasConnected = localStorage.getItem('metamask_connected');
      const savedAddress = localStorage.getItem('metamask_address');

      if (wasConnected && savedAddress && isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum!.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0 && accounts.includes(savedAddress)) {
            const chainId = await window.ethereum!.request({
              method: 'eth_chainId',
            });

            const balance = await getBalance(accounts[0]);

            setUser({
              address: accounts[0],
              chainId,
              isConnected: true,
              balance: formatBalance(balance),
            });
          } else {
            // Clear invalid stored data
            localStorage.removeItem('metamask_connected');
            localStorage.removeItem('metamask_address');
          }
        } catch (error) {
          console.error('Auto-connect failed:', error);
          localStorage.removeItem('metamask_connected');
          localStorage.removeItem('metamask_address');
        }
      }
    };

    autoConnect();
  }, []);

  const value: MetaMaskContextType = {
    user,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getCurrentNetwork,
    isNetworkSupported,
    refreshBalance,
  };

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  );
};

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      providers?: any[];
    };
  }
} 