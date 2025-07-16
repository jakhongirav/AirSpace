# 🚨 URGENT FIXES NEEDED

## **1. Create .env.local File**

**Create a file named `.env.local` in your project root with this content:**

```env
# ===== BLOCKCHAIN CONFIGURATION =====
PRIVATE_KEY=your-metamask-private-key-here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
MAINNET_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key

# ===== API KEYS (Optional) =====
ETHERSCAN_API_KEY=your-etherscan-api-key

# ===== FRONTEND CONFIGURATION =====
NEXT_PUBLIC_CHAINLINK_CCIP_ROUTER=0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_CIVIC_CLIENT_ID=4719a741-04a7-4c8c-a477-30360e66e12e

# ===== YOUR WALLET ADDRESS (REPLACE WITH YOUR ACTUAL ADDRESS) =====
NEXT_PUBLIC_RECIPIENT_ADDRESS=0xYourWalletAddressHere

# ===== CONTRACT ADDRESSES (UPDATE AFTER DEPLOYMENT) =====
NEXT_PUBLIC_AVALANCHE_CCIP_RECEIVER=0x...
NEXT_PUBLIC_AVALANCHE_CCIP_SENDER=0x...
NEXT_PUBLIC_AVALANCHE_NFT_CONTRACT=0x...
NEXT_PUBLIC_ZKSYNC_CONTRACT_ADDRESS=0x...

# ===== SERVER CONFIGURATION =====
PORT=3001

# ===== OASIS ROFL CONFIGURATION =====
NEXT_PUBLIC_ROFL_APP_ID=airspace-price-validator
NEXT_PUBLIC_ROFL_ENDPOINT=https://rofl-airspace.sapphire.oasis.dev
NEXT_PUBLIC_ROFL_PUBLIC_KEY=0x04...
```

## **2. Get Your Private Key**

1. Open MetaMask
2. Click on your account → Account Details
3. Click "Export Private Key"
4. Enter your password
5. **COPY THE PRIVATE KEY** and paste it in `.env.local`

## **3. Replace Your Wallet Address**

Replace `0xYourWalletAddressHere` with your actual wallet address from MetaMask.

## **4. Get AVAX Tokens**

1. Go to [Avalanche Faucet](https://faucet.avax.network/)
2. Connect your wallet
3. Request AVAX tokens
4. Wait for confirmation

## **5. Install Dependencies and Deploy**

```bash
# Install new dependencies
npm install

# Compile contracts
npm run compile

# Deploy to Avalanche
npm run deploy:avalanche-fuji
```

## **6. Update Contract Addresses**

After deployment, update these in your `.env.local`:

```env
NEXT_PUBLIC_AVALANCHE_CCIP_RECEIVER=0x[actual-address-from-deployment]
NEXT_PUBLIC_AVALANCHE_CCIP_SENDER=0x[actual-address-from-deployment]
NEXT_PUBLIC_AVALANCHE_NFT_CONTRACT=0x[actual-address-from-deployment]
```

## **7. Test Your Setup**

```bash
# Start the development server
npm run dev

# In another terminal, start the backend
npm run server

# Test the health endpoint
curl http://localhost:3001/health
```

## **8. Fix Flow Service Configuration**

**Create `src/config/flow.ts`:**

```typescript
const flowConfig = {
  NETWORK: "testnet",
  FLOW_ACCESS_NODE: "https://rest-testnet.onflow.org",
  FLOW_WALLET_DISCOVERY: "https://fcl-discovery.onflow.org/testnet/authn",
  APP_NAME: "AirSpace NFT Marketplace",
  APP_ICON: "https://airspace.com/icon.png",
  APP_DESCRIPTION: "Decentralized Air Rights Trading Platform",
  FLOW_TOKEN_ADDRESS: "0x7e60df042a9c0868",
  NON_FUNGIBLE_TOKEN_ADDRESS: "0x631e88ae7f1d7c20",
  METADATA_VIEWS_ADDRESS: "0x631e88ae7f1d7c20",
  AIRSPACE_NFT_CONTRACT_ADDRESS: "0x1234567890abcdef",
  DEFAULT_GAS_LIMIT: 999,
  FLOW_TX_STATUS: {
    SEALED: 4,
  },
  zkVerify: {
    supportedSystems: ["groth16", "plonk"],
    generateProof: (data: any) => ({
      id: `proof-${Date.now()}`,
      system: "groth16",
      data: JSON.stringify(data),
      timestamp: new Date().toISOString(),
    }),
  },
};

export default flowConfig;
```

## **9. Test Token Receiving**

```bash
# Test the wallet balance endpoint
curl -X POST http://localhost:3001/wallet-balance \
  -H "Content-Type: application/json" \
  -d '{"address":"0xYourWalletAddressHere"}'

# Test contract deployment
curl -X POST http://localhost:3001/execute-hardhat \
  -H "Content-Type: application/json" \
  -d '{"tokenId":1}'
```

## **10. Common Issues & Solutions**

### **"Module not found" errors**

```bash
npm install --save-dev @nomiclabs/hardhat-ethers @nomiclabs/hardhat-waffle
```

### **"Insufficient funds" error**

- Get more AVAX from the faucet
- Make sure you have at least 0.1 AVAX

### **"Network not supported" error**

- Add Avalanche Fuji to MetaMask
- Switch to the correct network

### **Server not starting**

```bash
# Kill any existing processes
pkill -f "ts-node"

# Start fresh
npm run server
```

## **11. Security Warnings**

⚠️ **NEVER commit your `.env.local` file to git!**
⚠️ **Keep your private key secure and never share it!**
⚠️ **Use testnet tokens only for development!**

---

## **12. Final Checklist**

- [ ] `.env.local` file created with all variables
- [ ] Private key added to `.env.local`
- [ ] Wallet address updated in `.env.local`
- [ ] AVAX tokens received from faucet
- [ ] Dependencies installed
- [ ] Contracts deployed to Avalanche
- [ ] Contract addresses updated in `.env.local`
- [ ] `src/config/flow.ts` created
- [ ] Server starts without errors
- [ ] Frontend connects to MetaMask
- [ ] All tests pass

**After completing these steps, your Web3 and server parts should work correctly!**
