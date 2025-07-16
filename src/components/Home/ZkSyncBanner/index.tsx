"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCivicAuth } from '@/context/CivicAuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const CivicAuthBanner = () => {
  const { isConnected, isConnecting, user } = useCivicAuth();
  const [isHovered, setIsHovered] = useState(false);

  // Format user display
  const formatUser = (user: any) => {
    if (user.email) return user.email;
    if (user.name) return user.name;
    if (user.id) return `${user.id.substring(0, 6)}...${user.id.substring(user.id.length - 4)}`;
    return 'Connected User';
  };

  return (
    <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] py-8 px-4 md:px-8">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 text-white"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center"
              animate={{ 
                rotate: isHovered ? 360 : 0,
                scale: isHovered ? 1.1 : 1
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <svg className="w-8 h-8 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </motion.div>
            <div>
              <h3 className="text-xl font-bold">Powered by Civic Auth</h3>
              <p className="text-white/80">Fast, secure, and simple authentication for Web3</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {!isConnected ? (
              <motion.button
                onClick={() => {
                  toast('Use the authentication button in the header to connect');
                }}
                disabled={isConnecting}
                className="bg-white text-[#6366F1] px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isConnecting ? 'Connecting...' : 'Get Started'}
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg font-medium border border-white/30"
              >
                <span className="text-white">Connected: {formatUser(user)}</span>
              </motion.div>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="https://docs.civic.com/auth" 
                target="_blank"
                className="border border-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors text-center block"
              >
                Learn About Civic Auth
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CivicAuthBanner; 