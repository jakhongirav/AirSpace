"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useROFLStatus } from '@/context/OasisROFLContext';
import Image from 'next/image';

export const OasisROFLStatus: React.FC = () => {
  const { isOnline, networkStatus, performance, teeAvailable } = useROFLStatus();

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-400' : 'text-red-400';
  };

  const getStatusBg = (status: boolean) => {
    return status ? 'bg-green-400/10 border-green-400/30' : 'bg-red-400/10 border-red-400/30';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative">
            <Image 
              src="/images/oasis-logo.svg" 
              alt="Oasis Network" 
              width={40} 
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">ROFL Service</h3>
            <p className="text-slate-400 text-sm">Trusted Execution Environment</p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusBg(isOnline)}`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} ${isOnline ? 'animate-pulse' : ''}`}></div>
          <span className={`text-xs font-medium ${getStatusColor(isOnline)}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">TEE Available</span>
            <div className={`w-3 h-3 rounded-full ${teeAvailable ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          </div>
          <p className={`font-semibold ${getStatusColor(teeAvailable)}`}>
            {teeAvailable ? 'Active' : 'Inactive'}
          </p>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Sapphire Network</span>
            <div className={`w-3 h-3 rounded-full ${networkStatus === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          </div>
          <p className={`font-semibold ${networkStatus === 'online' ? 'text-green-400' : 'text-gray-400'}`}>
            {networkStatus}
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-4">
        <h4 className="text-white font-medium text-sm">Performance Metrics</h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-slate-400 text-xs mb-1">Validations</p>
            <p className="text-white font-semibold text-lg">{performance.validations}</p>
          </div>
          
          <div className="text-center">
            <p className="text-slate-400 text-xs mb-1">Avg Time</p>
            <p className="text-white font-semibold text-lg">{performance.averageTime}ms</p>
          </div>
          
          <div className="text-center">
            <p className="text-slate-400 text-xs mb-1">Reliability</p>
            <p className="text-green-400 font-semibold text-lg">{performance.reliability}%</p>
          </div>
        </div>

        {/* Reliability Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Service Reliability</span>
            <span className="text-green-400">{performance.reliability}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${performance.reliability}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="grid grid-cols-1 gap-3 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Chain ID:</span>
            <span className="text-slate-300">0x5aff (Sapphire)</span>
          </div>
          <div className="flex justify-between">
            <span>Framework:</span>
            <span className="text-slate-300">Runtime Off-chain Logic</span>
          </div>
          <div className="flex justify-between">
            <span>Privacy:</span>
            <span className="text-green-400">TEE Protected</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
          <span>Powered by</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-sm"></div>
            <span className="font-medium text-slate-400">Oasis Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 