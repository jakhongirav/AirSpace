"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { CivicAuthProvider as CivicAuthProviderBase, useUser as useCivicUser } from '@civic/auth/react';
import { toast } from 'react-hot-toast';

// Define the shape of our context
interface CivicAuthContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | undefined;
  connectWithCivic: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  error: Error | null;
  isNewWallet: boolean;
  user: any;
}

// Create the context with a default value
const CivicAuthContext = createContext<CivicAuthContextType>({
  isConnected: false,
  isConnecting: false,
  address: undefined,
  connectWithCivic: async () => {},
  disconnectWallet: async () => {},
  error: null,
  isNewWallet: false,
  user: null,
});

// Create a hook to use the context
export const useCivicAuth = () => useContext(CivicAuthContext);

interface CivicAuthProviderProps {
  children: ReactNode;
  onNewWalletConnected?: (address: string) => Promise<void>;
}

// Inner component that uses Civic Auth hooks
const CivicAuthContextProvider: React.FC<CivicAuthProviderProps> = ({ 
  children, 
  onNewWalletConnected 
}) => {
  const userContext = useCivicUser();

  // Check if this is a new user
  const checkIfNewUser = (userId: string) => {
    if (typeof window !== 'undefined') {
      const knownUsers = localStorage.getItem('civic-known-users');
      const userArray = knownUsers ? JSON.parse(knownUsers) as string[] : [];
      
      if (!userArray.includes(userId)) {
        // This is a new user
        userArray.push(userId);
        localStorage.setItem('civic-known-users', JSON.stringify(userArray));
        return true;
      }
      
      return false;
    }
    
    return false;
  };

  // Main connect function
  const connectWithCivic = async () => {
    try {
      if (userContext.signIn) {
        await userContext.signIn();
        
        if (userContext.user && userContext.user.id) {
          const isNew = checkIfNewUser(userContext.user.id);
          
          if (isNew && onNewWalletConnected) {
            await onNewWalletConnected(userContext.user.id);
            
            toast.success('Welcome to AirSpace! Account created successfully.', {
              id: 'new-user-detected',
            });
          } else {
            toast.success('Successfully signed in with Civic Auth', {
              id: 'connect-success',
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to connect with Civic Auth:', err);
      
      if (err instanceof Error) {
        toast.error(`Failed to connect: ${err.message}`, {
          id: `connect-error-${err.message.substring(0, 20)}`,
        });
      } else {
        toast.error('Failed to connect with Civic Auth', {
          id: 'connect-unknown-error',
        });
      }
    }
  };

  // Disconnect function
  const disconnectWallet = async () => {
    try {
      if (userContext.signOut) {
        await userContext.signOut();
        
        toast.success('Signed out successfully', {
          id: 'disconnect-success',
        });
      }
    } catch (err) {
      console.error('Failed to sign out:', err);
      toast.error('Failed to sign out', {
        id: 'disconnect-error',
      });
    }
  };

  const value = {
    isConnected: !!userContext.user,
    isConnecting: userContext.isLoading || false,
    address: userContext.user?.id, // Using user ID as address for compatibility
    connectWithCivic,
    disconnectWallet,
    error: userContext.error || null,
    isNewWallet: false, // We handle this differently with Civic Auth
    user: userContext.user,
  };

  return (
    <CivicAuthContext.Provider value={value}>
      {children}
    </CivicAuthContext.Provider>
  );
};

// Main provider component that wraps with Civic Auth
export const CivicAuthProvider: React.FC<CivicAuthProviderProps> = ({ 
  children, 
  onNewWalletConnected 
}) => {
  return (
    <CivicAuthProviderBase clientId="4719a741-04a7-4c8c-a477-30360e66e12e">
      <CivicAuthContextProvider onNewWalletConnected={onNewWalletConnected}>
        {children}
      </CivicAuthContextProvider>
    </CivicAuthProviderBase>
  );
}; 