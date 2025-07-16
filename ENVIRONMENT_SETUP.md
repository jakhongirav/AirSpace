# 🔧 Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Blockchain Network Configuration
PRIVATE_KEY=your-private-key-here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
MAINNET_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key

# Block Explorer API Keys (Optional)
ETHERSCAN_API_KEY=your-etherscan-api-key

# Frontend Configuration
NEXT_PUBLIC_CHAINLINK_CCIP_ROUTER=0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_CIVIC_CLIENT_ID=your-civic-client-id

# Deployed Contract Addresses (Update after deployment)
NEXT_PUBLIC_AVALANCHE_CCIP_RECEIVER=0x...
NEXT_PUBLIC_AVALANCHE_CCIP_SENDER=0x...
NEXT_PUBLIC_AVALANCHE_NFT_CONTRACT=0x...

# Server Configuration
PORT=3001

# Oasis ROFL Configuration
NEXT_PUBLIC_ROFL_APP_ID=airspace-price-validator
NEXT_PUBLIC_ROFL_ENDPOINT=https://rofl-airspace.sapphire.oasis.dev
NEXT_PUBLIC_ROFL_PUBLIC_KEY=0x04...
```

## How to Get These Values

### 1. **PRIVATE_KEY**

- Export from MetaMask: Account Menu → Account Details → Export Private Key
- ⚠️ **Never commit this to git or share it publicly**

### 2. **ETHERSCAN_API_KEY** (Optional)

- Go to [Etherscan.io](https://etherscan.io)
- Create account → API Keys → Create API Key
- Use for Ethereum contract verification

### 3. **CIVIC_CLIENT_ID**

- Go to [Civic Developer Portal](https://civic.me)
- Create application → Get Client ID
- Use for identity verification

### 4. **Contract Addresses**

- Will be generated after running deployment script
- Update these values after successful deployment

## Security Notes

### ✅ **DO's**

- Use `.env.local` for local development
- Use platform environment variables for production
- Keep private keys secure and never share them

### ❌ **DON'Ts**

- Never commit `.env.local` to git
- Never share private keys
- Don't use mainnet private keys for testing

## Platform-Specific Setup

### **Vercel Deployment**

```bash
# Add environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_AVALANCHE_CCIP_RECEIVER
vercel env add NEXT_PUBLIC_AVALANCHE_CCIP_SENDER
vercel env add NEXT_PUBLIC_AVALANCHE_NFT_CONTRACT
```

### **Railway Deployment**

```bash
# Add environment variables to Railway
railway variables set PRIVATE_KEY=your-private-key
railway variables set PORT=3001
```

### **Heroku Deployment**

```bash
# Add environment variables to Heroku
heroku config:set PRIVATE_KEY=your-private-key
heroku config:set PORT=3001
```

## Testing Your Setup

```bash
# 1. Install dependencies
npm install

# 2. Compile contracts
npm run compile

# 3. Test deployment (dry run)
npx hardhat run scripts/deploy-avalanche.js --network hardhat

# 4. Deploy to testnet
npm run deploy:avalanche-fuji
```

## Troubleshooting

### **Common Issues**

1. **"Insufficient funds"**

   - Get AVAX from [Avalanche Faucet](https://faucet.avax.network/)
   - Need at least 0.1 AVAX for deployment

2. **"Invalid private key"**

   - Check private key format (should start with 0x)
   - Ensure no extra spaces or characters

3. **"Network not found"**

   - Check RPC URLs are correct
   - Verify network configuration in `hardhat.config.js`

4. **"Contract verification failed"**
   - Check API key is correct
   - Ensure contract is deployed before verification

### **Getting Help**

- Check [Hardhat Documentation](https://hardhat.org/docs)
- Visit [Avalanche Developer Docs](https://docs.avax.network/)
- Join [Avalanche Discord](https://discord.gg/avalanche)

---

**Remember**: Keep your private keys secure and never share them publicly! 🔐
