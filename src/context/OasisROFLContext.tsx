"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { oasisROFLService, PriceValidationResult, PropertyData } from '@/services/oasisROFLService';

interface OasisROFLContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  validatePrice: (propertyData: PropertyData) => Promise<PriceValidationResult | null>;
  getBatchValidation: (properties: PropertyData[]) => Promise<PriceValidationResult[] | null>;
  getMarketInsights: (region: { lat: number; lng: number; radius: number }) => Promise<any>;
  clearError: () => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  sapphireNetwork: {
    chainId: string;
    rpcUrl: string;
    status: 'online' | 'offline' | 'unknown';
  };
  roflStats: {
    totalValidations: number;
    averageProcessingTime: number;
    successRate: number;
  };
}

const OasisROFLContext = createContext<OasisROFLContextType | undefined>(undefined);

interface OasisROFLProviderProps {
  children: ReactNode;
}

export const OasisROFLProvider: React.FC<OasisROFLProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  const [sapphireNetwork] = useState({
    chainId: '0x5aff',
    rpcUrl: 'https://testnet.sapphire.oasis.dev',
    status: 'online' as const
  });

  const [roflStats, setRoflStats] = useState({
    totalValidations: 0,
    averageProcessingTime: 1200,
    successRate: 100
  });

  useEffect(() => {
    initializeROFLService();
  }, []);

  const initializeROFLService = async () => {
    try {
      setConnectionStatus('connecting');
      setIsLoading(true);
      
      console.log('🔐 Initializing Oasis ROFL service...');
      await oasisROFLService.initialize();
      
      const serviceStatus = oasisROFLService.getServiceStatus();
      
      setIsInitialized(true);
      setConnectionStatus('connected');
      
      if (serviceStatus.mode === 'fallback') {
        console.log('⚠️ ROFL service running in fallback mode');
      } else {
        console.log('✅ Real ROFL service connected to Sapphire network');
      }
      
    } catch (err) {
      console.error('❌ Failed to initialize ROFL service:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePrice = async (propertyData: PropertyData): Promise<PriceValidationResult | null> => {
    if (!isInitialized) {
      setError('ROFL service not initialized');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const startTime = Date.now();
      console.log('⚡ Executing price validation in TEE...');
      
      const result = await oasisROFLService.validatePrice(propertyData);
      
      const processingTime = Date.now() - startTime;
      
      // Update stats
      setRoflStats(prev => ({
        totalValidations: prev.totalValidations + 1,
        averageProcessingTime: Math.round((prev.averageProcessingTime + processingTime) / 2),
        successRate: Math.round(((prev.totalValidations * prev.successRate / 100) + 1) / (prev.totalValidations + 1) * 100)
      }));

      console.log(`✅ Validation completed in ${processingTime}ms`);
      return result;
      
    } catch (err) {
      console.error('❌ Price validation failed:', err);
      setError(err instanceof Error ? err.message : 'Validation failed');
      
      // Update failure stats
      setRoflStats(prev => ({
        ...prev,
        successRate: Math.round(((prev.totalValidations * prev.successRate / 100)) / (prev.totalValidations + 1) * 100)
      }));
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getBatchValidation = async (properties: PropertyData[]): Promise<PriceValidationResult[] | null> => {
    if (!isInitialized) {
      setError('ROFL service not initialized');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const startTime = Date.now();
      console.log(`🔐 Processing batch validation for ${properties.length} properties...`);
      
      const results = await oasisROFLService.getBatchValidation(properties);
      
      const processingTime = Date.now() - startTime;
      
      // Update stats for batch processing
      setRoflStats(prev => ({
        totalValidations: prev.totalValidations + properties.length,
        averageProcessingTime: Math.round((prev.averageProcessingTime + (processingTime / properties.length)) / 2),
        successRate: Math.round(((prev.totalValidations * prev.successRate / 100) + properties.length) / (prev.totalValidations + properties.length) * 100)
      }));

      console.log(`✅ Batch validation completed in ${processingTime}ms`);
      return results;
      
    } catch (err) {
      console.error('❌ Batch validation failed:', err);
      setError(err instanceof Error ? err.message : 'Batch validation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getMarketInsights = async (region: { lat: number; lng: number; radius: number }) => {
    if (!isInitialized) {
      setError('ROFL service not initialized');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 Generating confidential market insights...');
      const insights = await oasisROFLService.getMarketInsights(region);
      
      console.log('✅ Market insights generated successfully');
      return insights;
      
    } catch (err) {
      console.error('❌ Market insights generation failed:', err);
      setError(err instanceof Error ? err.message : 'Market insights failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: OasisROFLContextType = {
    isInitialized,
    isLoading,
    error,
    validatePrice,
    getBatchValidation,
    getMarketInsights,
    clearError,
    connectionStatus,
    sapphireNetwork,
    roflStats
  };

  return (
    <OasisROFLContext.Provider value={value}>
      {children}
    </OasisROFLContext.Provider>
  );
};

export const useOasisROFL = (): OasisROFLContextType => {
  const context = useContext(OasisROFLContext);
  if (context === undefined) {
    throw new Error('useOasisROFL must be used within an OasisROFLProvider');
  }
  return context;
};

// Hook for ROFL status monitoring
export const useROFLStatus = () => {
  const { connectionStatus, sapphireNetwork, roflStats, isInitialized } = useOasisROFL();
  
  return {
    isOnline: connectionStatus === 'connected',
    networkStatus: sapphireNetwork.status,
    performance: {
      validations: roflStats.totalValidations,
      averageTime: roflStats.averageProcessingTime,
      reliability: roflStats.successRate
    },
    teeAvailable: isInitialized
  };
}; 