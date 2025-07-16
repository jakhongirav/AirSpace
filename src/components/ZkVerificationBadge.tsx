import React, { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

interface ZkVerificationBadgeProps {
  verified: boolean;
  proofId?: string;
  system?: string;
  className?: string;
}

const ZkVerificationBadge: React.FC<ZkVerificationBadgeProps> = ({
  verified,
  proofId,
  system = 'groth16',
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div 
        className="flex items-center cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {verified ? (
          <div className="flex items-center text-green-500">
            <ShieldCheckIcon className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">ZK Verified</span>
            <CheckCircleIcon className="h-4 w-4 ml-1" />
          </div>
        ) : (
          <div className="flex items-center text-gray-400">
            <ShieldCheckIcon className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">ZK Pending</span>
          </div>
        )}
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded shadow-lg z-10 max-w-xs">
          <p className="font-semibold mb-1">ZK Verification Status</p>
          <p className="text-sm mb-1">
            {verified ? 'Verified ✓' : 'Not Verified ✗'}
          </p>
          {proofId && (
            <p className="text-xs text-gray-300 mb-1">Proof ID: {proofId.substring(0, 8)}...</p>
          )}
          {system && (
            <p className="text-xs text-gray-300">Proof System: {system}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ZkVerificationBadge; 