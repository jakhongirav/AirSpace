# 📋 STEP-BY-STEP DEPLOYMENT GUIDE

## 🎯 **Complete Deployment Process for AirSpace**

### **📅 Estimated Time: 30-45 minutes**

---

## **PHASE 1: ENVIRONMENT SETUP (10 minutes)**

### **Step 1.1: Check Your Current Directory**

```bash
pwd
# Expected output: /Users/jahongirabdujalilov/Desktop/air-space
```

### **Step 1.2: Verify Project Structure**

```bash
ls -la
# You should see:
# - src/
# - scripts/
# - hardhat.config.js
# - package.json
# - .env.local (if already created)
```

### **Step 1.3: Create .env.local File**

```bash
# Create the environment file
touch .env.local

# Open in your preferred editor
code .env.local
# OR
nano .env.local
```

**Copy and paste this EXACT content into .env.local:**

```env
# ===== BLOCKCHAIN CONFIGURATION =====
PRIVATE_KEY=your-private-key-will-go-here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
MAINNET_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key

# ===== API KEYS (Optional) =====
ETHERSCAN_API_KEY=your-etherscan-api-key

# ===== FRONTEND CONFIGURATION =====
NEXT_PUBLIC_CHAINLINK_CCIP_ROUTER=0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_CIVIC_CLIENT_ID=4719a741-04a7-4c8c-a477-30360e66e12e

# ===== YOUR WALLET ADDRESS (UPDATE THIS) =====
NEXT_PUBLIC_RECIPIENT_ADDRESS=0xYourWalletAddressHere

# ===== CONTRACT ADDRESSES (WILL BE UPDATED AFTER DEPLOYMENT) =====
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

### **Step 1.4: Get Your MetaMask Private Key**

1. **Open MetaMask Extension**
2. **Click on your account name** (top of the extension)
3. **Select "Account Details"**
4. **Click "Show Private Key"**
5. **Enter your MetaMask password**
6. **Copy the private key** (starts with 0x)
7. **Replace `your-private-key-will-go-here` in .env.local**

### **Step 1.5: Get Your Wallet Address**

1. **In MetaMask, copy your wallet address** (click on the address at the top)
2. **Replace `0xYourWalletAddressHere` in .env.local**

### **Step 1.6: Verify Environment File**

```bash
cat .env.local | grep PRIVATE_KEY
# Should show: PRIVATE_KEY=0x[your-actual-private-key]

cat .env.local | grep NEXT_PUBLIC_RECIPIENT_ADDRESS
# Should show: NEXT_PUBLIC_RECIPIENT_ADDRESS=0x[your-wallet-address]
```

---

## **PHASE 2: DEPENDENCIES & SETUP (5 minutes)**

### **Step 2.1: Install Dependencies**

```bash
npm install
# Wait for installation to complete
```

### **Step 2.2: Test Setup**

```bash
npm run test-setup
# Expected output should show mostly ✅ checkmarks
```

### **Step 2.3: Compile Contracts**

```bash
npm run compile
# Expected output: "Compiled X Solidity files successfully"
```

---

## **PHASE 3: GET AVALANCHE TOKENS (5 minutes)**

### **Step 3.1: Add Avalanche Fuji to MetaMask**

1. **Open MetaMask**
2. **Click network dropdown** (top of extension)
3. **Click "Add Network"**
4. **Fill in these EXACT details:**
   - **Network Name**: `Avalanche Fuji Testnet`
   - **New RPC URL**: `https://api.avax-test.network/ext/bc/C/rpc`
   - **Chain ID**: `43113`
   - **Currency Symbol**: `AVAX`
   - **Block Explorer URL**: `https://explorer.avax-test.network/`
5. **Click "Save"**

### **Step 3.2: Get AVAX Tokens**

1. **Go to**: https://faucet.avax.network/
2. **Connect your MetaMask wallet**
3. **Make sure you're on Avalanche Fuji network**
4. **Click "Request 2 AVAX"**
5. **Wait for confirmation** (usually 1-2 minutes)

### **Step 3.3: Verify AVAX Balance**

```bash
# Check your balance using our deployment script
node -e "
const { ethers } = require('hardhat');
async function checkBalance() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  console.log('Address:', deployer.address);
  console.log('Balance:', ethers.utils.formatEther(balance), 'AVAX');
}
checkBalance();
"
```

**Expected output:**

```
Address: 0x[your-wallet-address]
Balance: 2.0 AVAX
```

---

## **PHASE 4: CONTRACT DEPLOYMENT (10 minutes)**

### **Step 4.1: Pre-deployment Check**

```bash
# Verify contracts compile
npm run compile

# Check if we have the deployment script
ls scripts/
# Should show: deploy-avalanche.js
```

### **Step 4.2: Deploy to Avalanche Fuji**

```bash
npm run deploy:avalanche-fuji
```

**Expected output:**

```
🏔️ Deploying AirSpace contracts to Avalanche...
Network: unknown | Chain ID: 43113
Deploying with account: 0x[your-address]
Account balance: 2.0 AVAX
Using CCIP Router: 0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8
Using LINK Token: 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846

1️⃣ Deploying AirSpaceCCIPReceiver...
✅ CCIP Receiver deployed to: 0x[contract-address-1]

2️⃣ Deploying AirSpaceCCIPSender...
✅ CCIP Sender deployed to: 0x[contract-address-2]

3️⃣ Deploying PolkadotAirSpaceNFT...
✅ NFT Contract deployed to: 0x[contract-address-3]

🎉 Deployment Complete!
📄 Deployment summary saved to: deployments/avalanche-fuji.json

📋 Contract Addresses:
├── CCIP Receiver: 0x[contract-address-1]
├── CCIP Sender: 0x[contract-address-2]
├── NFT Contract: 0x[contract-address-3]

🔍 View on Avalanche Explorer:
├── CCIP Receiver: https://explorer.avax-test.network/address/0x[contract-address-1]
├── CCIP Sender: https://explorer.avax-test.network/address/0x[contract-address-2]
├── NFT Contract: https://explorer.avax-test.network/address/0x[contract-address-3]
```

### **Step 4.3: Save Deployment Information**

```bash
# Check deployment file was created
ls deployments/
# Should show: avalanche-fuji.json

# View deployment details
cat deployments/avalanche-fuji.json
```

---

## **PHASE 5: UPDATE ENVIRONMENT VARIABLES (5 minutes)**

### **Step 5.1: Get Contract Addresses**

```bash
# Extract contract addresses from deployment file
node -e "
const deployment = require('./deployments/avalanche-fuji.json');
console.log('CCIP Receiver:', deployment.contracts.ccipReceiver);
console.log('CCIP Sender:', deployment.contracts.ccipSender);
console.log('NFT Contract:', deployment.contracts.nftContract);
"
```

### **Step 5.2: Update .env.local**

```bash
# Open .env.local file
code .env.local
# OR
nano .env.local
```

**Update these lines with your actual contract addresses:**

```env
# Replace 0x... with actual addresses from deployment
NEXT_PUBLIC_AVALANCHE_CCIP_RECEIVER=0x[actual-ccip-receiver-address]
NEXT_PUBLIC_AVALANCHE_CCIP_SENDER=0x[actual-ccip-sender-address]
NEXT_PUBLIC_AVALANCHE_NFT_CONTRACT=0x[actual-nft-contract-address]
```

### **Step 5.3: Verify Environment Update**

```bash
# Check if addresses are updated
grep "NEXT_PUBLIC_AVALANCHE_" .env.local
# Should show actual contract addresses, not 0x...
```

---

## **PHASE 6: TESTING & VERIFICATION (5 minutes)**

### **Step 6.1: Test Contract Access**

```bash
# Test if contracts are accessible
node -e "
const { ethers } = require('hardhat');
async function testContracts() {
  const ccipReceiver = '0x[your-ccip-receiver-address]';
  const code = await ethers.provider.getCode(ccipReceiver);
  console.log('Contract deployed:', code !== '0x');
  console.log('Contract size:', code.length, 'bytes');
}
testContracts();
"
```

### **Step 6.2: Start Development Server**

```bash
# Start Next.js development server
npm run dev
```

**Expected output:**

```
▲ Next.js 14.2.25
- Local:        http://localhost:3000
- Experiments (use with caution):
  · typedRoutes

✓ Ready in 2.3s
```

### **Step 6.3: Start Backend Server**

```bash
# In a new terminal window
cd /Users/jahongirabdujalilov/Desktop/air-space
npm run server
```

**Expected output:**

```
Server running on port 3001
CORS enabled for all origins
```

### **Step 6.4: Test Server Health**

```bash
# In another terminal window
curl http://localhost:3001/health
```

**Expected output:**

```json
{ "status": "ok", "timestamp": "2024-01-XX..." }
```

---

## **PHASE 7: BROWSER TESTING (5 minutes)**

### **Step 7.1: Open Application**

1. **Go to**: http://localhost:3000
2. **Check console for errors** (F12 → Console)
3. **Verify MetaMask connection works**

### **Step 7.2: Test Wallet Connection**

1. **Click "Connect Wallet"** (if available)
2. **Switch to Avalanche Fuji network**
3. **Verify wallet shows correct network**

### **Step 7.3: Test Contract Interaction**

1. **Open browser console** (F12)
2. **Run this command:**

```javascript
console.log("Environment check:");
console.log("CCIP Receiver:", process.env.NEXT_PUBLIC_AVALANCHE_CCIP_RECEIVER);
console.log("CCIP Sender:", process.env.NEXT_PUBLIC_AVALANCHE_CCIP_SENDER);
console.log("NFT Contract:", process.env.NEXT_PUBLIC_AVALANCHE_NFT_CONTRACT);
```

---

## **PHASE 8: DEPLOYMENT VERIFICATION**

### **Step 8.1: View Contracts on Explorer**

Visit these URLs (replace with your actual addresses):

- **CCIP Receiver**: https://explorer.avax-test.network/address/0x[your-ccip-receiver-address]
- **CCIP Sender**: https://explorer.avax-test.network/address/0x[your-ccip-sender-address]
- **NFT Contract**: https://explorer.avax-test.network/address/0x[your-nft-contract-address]

### **Step 8.2: Verify Contract Details**

For each contract, check:

- ✅ Contract creation transaction exists
- ✅ Contract code is visible
- ✅ No errors in deployment
- ✅ Constructor parameters are correct

---

## **🚨 TROUBLESHOOTING GUIDE**

### **Problem 1: "Insufficient funds" Error**

**Solution:**

```bash
# Check your AVAX balance
node -e "
const { ethers } = require('hardhat');
async function checkBalance() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  console.log('Balance:', ethers.utils.formatEther(balance), 'AVAX');
}
checkBalance();
"

# If balance is low, get more AVAX from faucet
```

### **Problem 2: "Network not supported" Error**

**Solution:**

```bash
# Check your network configuration
node -e "
const config = require('./hardhat.config.js');
console.log('Avalanche Fuji config:', config.networks.avalancheFuji);
"
```

### **Problem 3: "Module not found" Error**

**Solution:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **Problem 4: "Transaction failed" Error**

**Solution:**

```bash
# Check gas price and retry
npm run deploy:avalanche-fuji
```

### **Problem 5: "Private key invalid" Error**

**Solution:**

1. **Check .env.local file format**
2. **Ensure private key starts with 0x**
3. **No spaces or extra characters**

---

## **✅ FINAL CHECKLIST**

### **Before Submitting to Hackathon:**

- [ ] ✅ All contracts deployed successfully
- [ ] ✅ Contract addresses updated in .env.local
- [ ] ✅ Frontend connects to MetaMask
- [ ] ✅ Server runs without errors
- [ ] ✅ Contracts visible on Avalanche Explorer
- [ ] ✅ All tests passing (`npm run test-setup`)
- [ ] ✅ Application loads at localhost:3000
- [ ] ✅ Wallet connection works
- [ ] ✅ No console errors in browser

### **Documentation Ready:**

- [ ] ✅ Contract addresses documented
- [ ] ✅ Explorer links ready to share
- [ ] ✅ Demo video recorded
- [ ] ✅ GitHub repository updated
- [ ] ✅ README includes deployment info

---

## **📝 DEPLOYMENT SUMMARY**

**Congratulations! You have successfully deployed AirSpace to Avalanche Fuji testnet!**

### **Your Deployed Contracts:**

- **CCIP Receiver**: `0x[your-actual-address]`
- **CCIP Sender**: `0x[your-actual-address]`
- **NFT Contract**: `0x[your-actual-address]`

### **Next Steps:**

1. **Test all functionality**
2. **Create demo video**
3. **Update project documentation**
4. **Submit to hackathon**

### **Live URLs:**

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Contracts**: https://explorer.avax-test.network/

**🎉 Your AirSpace application is now live and ready for the hackathon!**
