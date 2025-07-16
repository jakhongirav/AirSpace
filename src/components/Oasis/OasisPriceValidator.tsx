"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NFT } from '@/types/nft';
import { PriceValidationResult, PropertyData } from '@/services/oasisROFLService';

interface OasisPriceValidatorProps {
  nft: NFT;
  onValidationComplete?: (result: PriceValidationResult) => void;
}

export const OasisPriceValidator: React.FC<OasisPriceValidatorProps> = ({ 
  nft, 
  onValidationComplete 
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<PriceValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidatePrice = async () => {
    setIsValidating(true);
    setError(null);

    try {
      const propertyData: PropertyData = {
        tokenId: nft.id,
        propertyAddress: nft.propertyAddress,
        currentHeight: nft.currentHeight,
        maximumHeight: nft.maximumHeight,
        availableFloors: nft.availableFloors,
        askingPrice: nft.price,
        latitude: nft.latitude || 0,
        longitude: nft.longitude || 0,
        title: nft.title
      };

      const response = await fetch('/api/oasis-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validate-price',
          data: propertyData
        })
      });

      const result = await response.json();

      if (result.success) {
        setValidationResult(result.data);
        onValidationComplete?.(result.data);
      } else {
        setError(result.error || 'Validation failed');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'good': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'fair': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'poor': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'overpriced': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent': return '🌟';
      case 'good': return '👍';
      case 'fair': return '⚖️';
      case 'poor': return '⚠️';
      case 'overpriced': return '🚨';
      default: return '❓';
    }
  };

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case 'underpriced': return 'text-green-400';
      case 'fair': return 'text-yellow-400';
      case 'overpriced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
      {/* Header with Oasis Branding */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Price Validation</h3>
            <p className="text-slate-400 text-sm">Powered by Oasis ROFL</p>
          </div>
        </div>
        
        {/* Oasis Badge */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-3 py-1 rounded-full border border-purple-500/30">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-purple-300 text-xs font-medium">TEE Protected</span>
        </div>
      </div>

      {/* Validation Button */}
      {!validationResult && (
        <motion.button
          onClick={handleValidatePrice}
          disabled={isValidating}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Validating in TEE...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Validate Price</span>
            </>
          )}
        </motion.button>
      )}

      {/* Validation Results */}
      <AnimatePresence>
        {validationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Rating Badge */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${getRatingColor(validationResult.rating)}`}>
                <span className="text-xl">{getRatingIcon(validationResult.rating)}</span>
                <span className="font-semibold capitalize">{validationResult.rating}</span>
              </div>
              
              <div className="text-right">
                <p className="text-slate-400 text-sm">Market Position</p>
                <p className={`font-semibold capitalize ${getMarketPositionColor(validationResult.marketPosition)}`}>
                  {validationResult.marketPosition}
                </p>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Confidence Score</span>
                <span className="text-white font-semibold">{Math.round(validationResult.confidence * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${validationResult.confidence * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-2">
              <h4 className="text-white font-medium">AI Insights</h4>
              {validationResult.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-2 text-slate-300 text-sm"
                >
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{insight}</span>
                </motion.div>
              ))}
            </div>

            {/* Technical Details */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Validated: {new Date(validationResult.validatedAt).toLocaleString()}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>TEE Verified</span>
                </div>
              </div>
            </div>

            {/* Revalidate Option */}
            <motion.button
              onClick={() => {
                setValidationResult(null);
                setError(null);
              }}
              className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              Revalidate Price
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer with Oasis Attribution */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
          <span>Secured by</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-sm"></div>
            <span className="font-medium text-slate-400">Oasis Network</span>
          </div>
          <span>•</span>
          <span>ROFL Framework</span>
        </div>
      </div>
    </div>
  );
}; 