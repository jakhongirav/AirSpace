"use client";

import React from 'react';
import { UserButton } from '@civic/auth/react';
import { useCivicAuth } from '@/context/CivicAuthContext';
import { Button } from '@/components/SharedComponent/Button';
import { Loader2 } from 'lucide-react';

interface CivicAuthButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive' | 'primary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showUserButton?: boolean;
}

export const CivicAuthButton: React.FC<CivicAuthButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  showUserButton = true,
}) => {
  const { isConnected, isConnecting, connectWithCivic, disconnectWallet, user } = useCivicAuth();

  // If user is connected and we want to show the user button, use Civic's UserButton
  if (isConnected && user && showUserButton) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <UserButton />
      </div>
    );
  }

  // If user is connected but we don't want the user button, show a disconnect button
  if (isConnected && user && !showUserButton) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={disconnectWallet}
      >
        Sign Out
      </Button>
    );
  }

  // If user is not connected, show connect button
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={connectWithCivic}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        'Sign In with Civic'
      )}
    </Button>
  );
}; 