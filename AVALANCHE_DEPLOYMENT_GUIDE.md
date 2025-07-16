# 🏔️ Avalanche Deployment Guide for Hackathon

## 📋 **What to Deploy Where**

### **🏔️ Avalanche Blockchain** (Smart Contracts)

- `AirSpaceCCIPReceiver.sol` ✅
- `AirSpaceCCIPSender.sol` ✅
- `PolkadotAirSpaceNFT.sol` ✅
- `ZkSyncETHTransfer.sol` ✅

### **🌐 Vercel/Netlify** (Frontend)

- Entire Next.js application ✅
- All React components ✅
- API routes ✅

### **☁️ Cloud Server** (Backend)

- Express.js server (`src/server/`) ✅
- Hardhat deployment scripts ✅

---

## 🚀 **Step-by-Step Avalanche Deployment**

### **Step 1: Setup Avalanche Deployment Environment**

```bash
# Install Avalanche dependencies
npm install --save-dev @avalabs/avalanche-cli @avalabs/subnet-cli

# Create Hardhat config for Avalanche
# Add to hardhat.config.js
```

Create `hardhat.config.js`:

```javascript
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.24",
  networks: {
    avalancheFuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [process.env.PRIVATE_KEY], // Your private key
      chainId: 43113,
    },
    avalancheMainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 43114,
    },
  },
};
```

### **Step 2: Deploy Smart Contracts to Avalanche**

Create deployment script `scripts/deploy-avalanche.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying AirSpace contracts to Avalanche...");

  // 1. Deploy CCIP Receiver
  const AirSpaceCCIPReceiver = await ethers.getContractFactory(
    "AirSpaceCCIPReceiver"
  );
  const ccipReceiver = await AirSpaceCCIPReceiver.deploy(
    "0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8", // Avalanche Fuji CCIP Router
    "AirSpace NFT",
    "AIRNFT"
  );
  await ccipReceiver.deployed();
  console.log("✅ CCIP Receiver deployed to:", ccipReceiver.address);

  // 2. Deploy CCIP Sender
  const AirSpaceCCIPSender = await ethers.getContractFactory(
    "AirSpaceCCIPSender"
  );
  const ccipSender = await AirSpaceCCIPSender.deploy(
    "0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8", // Avalanche Fuji CCIP Router
    "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846" // Avalanche Fuji LINK Token
  );
  await ccipSender.deployed();
  console.log("✅ CCIP Sender deployed to:", ccipSender.address);

  // 3. Deploy NFT Contract
  const PolkadotAirSpaceNFT = await ethers.getContractFactory(
    "PolkadotAirSpaceNFT"
  );
  const nftContract = await PolkadotAirSpaceNFT.deploy();
  await nftContract.deployed();
  console.log("✅ NFT Contract deployed to:", nftContract.address);

  // Save addresses for frontend
  const addresses = {
    ccipReceiver: ccipReceiver.address,
    ccipSender: ccipSender.address,
    nftContract: nftContract.address,
    network: "avalancheFuji",
    chainId: 43113,
  };

  console.log("\n🎉 Deployment Complete!");
  console.log("Contract Addresses:", addresses);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### **Step 3: Run Deployment**

```bash
# Set your private key
export PRIVATE_KEY="your-private-key-here"

# Deploy to Avalanche Fuji Testnet
npx hardhat run scripts/deploy-avalanche.js --network avalancheFuji

# For mainnet (when ready)
npx hardhat run scripts/deploy-avalanche.js --network avalancheMainnet
```

### **Step 4: Update Frontend Configuration**

Update your MetaMask context to use deployed addresses:

```typescript
// In src/context/MetaMaskContext.tsx
const CONTRACT_ADDRESSES = {
  AVALANCHE_FUJI: {
    CCIP_SENDER: "0x...", // From deployment
    CCIP_RECEIVER: "0x...", // From deployment
    NFT_CONTRACT: "0x...", // From deployment
  },
};
```

### **Step 5: Deploy Frontend to Vercel**

```bash
# Deploy Next.js app to Vercel
npx vercel --prod

# Or use Vercel dashboard
# 1. Connect GitHub repo
# 2. Auto-deploy on push
# 3. Add environment variables
```

### **Step 6: Deploy Backend Server**

```bash
# Option 1: Railway
railway login
railway init
railway add
railway up

# Option 2: Heroku
heroku create airspace-server
git push heroku main

# Option 3: DigitalOcean App Platform
# Use their dashboard to deploy
```

---

## 🎯 **For Hackathon Judges**

### **What to Highlight:**

1. **✅ Smart Contracts on Avalanche**

   - Show contract addresses on Avalanche Explorer
   - Demonstrate transaction speed (<2 seconds)
   - Prove gas cost efficiency

2. **✅ Frontend Integration**

   - Show seamless Avalanche connection
   - Demonstrate MetaMask network switching
   - Prove cross-chain functionality

3. **✅ Performance Metrics**
   - Transaction speed comparisons
   - Gas cost analysis
   - User experience improvements

### **Demo Script for Judges:**

```markdown
1. **Connect MetaMask** → Switch to Avalanche Fuji
2. **Show Contract on Avalanche Explorer** → Verify deployment
3. **Execute Transaction** → Demonstrate speed
4. **Cross-Chain Transfer** → Show CCIP integration
5. **Cost Comparison** → Highlight savings
```

---

## 📊 **Post-Deployment Verification**

### **Contract Verification on Avalanche Explorer**

Contracts are automatically viewable on the free Avalanche Explorer:

- **Fuji Testnet**: https://explorer.avax-test.network/
- **Mainnet**: https://explorer.avax.network/

No API keys or verification steps required!

### **Frontend Environment Variables**

```env
# .env.local
NEXT_PUBLIC_AVALANCHE_CCIP_RECEIVER=0x...
NEXT_PUBLIC_AVALANCHE_CCIP_SENDER=0x...
NEXT_PUBLIC_AVALANCHE_NFT_CONTRACT=0x...
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

### **Testing Integration**

```bash
# Test cross-chain functionality
npm run test:ccip

# Test Avalanche transactions
npm run test:avalanche

# Test frontend integration
npm run test:e2e
```

---

## 🏆 **Hackathon Submission Checklist**

### **✅ Technical Requirements**

- [ ] Smart contracts deployed to Avalanche
- [ ] Frontend deployed and accessible
- [ ] Backend server running
- [ ] Cross-chain functionality working
- [ ] Documentation complete

### **✅ Demo Requirements**

- [ ] Live demo URL
- [ ] Contract addresses on Avalanche Explorer
- [ ] Performance metrics documented
- [ ] Video demo recorded
- [ ] GitHub repo public

### **✅ Judging Criteria**

- [ ] Technical innovation ✅
- [ ] User experience ✅
- [ ] Avalanche integration ✅
- [ ] Real-world impact ✅
- [ ] Code quality ✅

---

## 🎬 **Final Steps**

1. **Deploy contracts** → Get Avalanche addresses
2. **Deploy frontend** → Get live URL
3. **Deploy backend** → Get server URL
4. **Update documentation** → Add all URLs
5. **Create demo video** → Show working system
6. **Submit to hackathon** → Include all links

**Remember**: You're not deploying Next.js TO Avalanche, you're deploying smart contracts to Avalanche and connecting your Next.js app to them! 🚀
