"use client";

import React from 'react';
import { useCivicAuth } from '@/context/CivicAuthContext';

interface CivicAccountInfoProps {
  className?: string;
}

const CivicAccountInfo: React.FC<CivicAccountInfoProps> = ({ className = '' }) => {
  const { isConnected, isConnecting, address, user } = useCivicAuth();

  if (isConnecting) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-48"></div>
      </div>
    );
  }

  if (!isConnected || !user) {
    return (
      <div className={`text-gray-500 ${className}`}>
        <p>Not connected to Civic Auth</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div>
        <span className="font-medium text-gray-700">User ID:</span>
        <span className="ml-2 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          {address}
        </span>
      </div>
      {user.email && (
        <div>
          <span className="font-medium text-gray-700">Email:</span>
          <span className="ml-2 text-sm">{user.email}</span>
        </div>
      )}
      {user.name && (
        <div>
          <span className="font-medium text-gray-700">Name:</span>
          <span className="ml-2 text-sm">{user.name}</span>
        </div>
      )}
    </div>
  );
};

export default CivicAccountInfo; 