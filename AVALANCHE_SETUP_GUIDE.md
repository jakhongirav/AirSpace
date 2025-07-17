# 🏔️ Avalanche NFT Setup Guide

## 🚨 **Quick Fix for "Contract execution reverted" Error**

If you're getting "Contract execution reverted" error, it's because you need to be an **authorized minter**. Here's how to fix it:

### **Step 1: Get Your Wallet Address**

1. Open MetaMask
2. Copy your wallet address (starts with `0x...`)

### **Step 2: Add Yourself as Authorized Minter**

```bash
# Replace YOUR_WALLET_ADDRESS with your actual address
npm run add-minter YOUR_WALLET_ADDRESS
```

**Example:**

```bash
npm run add-minter 0x1234567890abcdef1234567890abcdef12345678
```

### **Step 3: Test the Purchase**

1. Go to the listings page
2. Click "Buy Now" on any property
3. Complete the purchase flow

---

## 🎯 **Complete Setup Guide**

### **Prerequisites**

- ✅ MetaMask installed
- ✅ Avalanche Fuji testnet added to MetaMask
- ✅ AVAX tokens from [Avalanche Faucet](https://faucet.avax.network/)
- ✅ `.env.local` file with your private key

### **Environment Setup**

Create `.env.local` in your project root:

```env
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here
```

### **Contract Information**

- **Network**: Avalanche Fuji Testnet
- **Contract Address**: `0xEF515f802e3026f540BC8654d2B3a475A242a2B9`
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://explorer.avax-test.network

---

## 🔧 **Available Commands**

### **Development**

```bash
npm run dev          # Start development server
npm run server       # Start backend server
```

### **Contract Management**

```bash
npm run add-minter <address>     # Add authorized minter
npm run compile                  # Compile contracts
npm run deploy:avalanche-fuji    # Deploy to Avalanche Fuji
```

### **Testing**

```bash
npm run test-setup              # Test deployment setup
npm run check-deployment        # Check deployment status
```

---

## 🎮 **How to Use**

### **1. Connect MetaMask**

- Make sure you're on Avalanche Fuji testnet
- Connect your wallet to the application

### **2. Add Yourself as Authorized Minter**

```bash
npm run add-minter YOUR_WALLET_ADDRESS
```

### **3. Purchase Air Rights**

1. Go to `/listings`
2. Click "Buy Now" on any property
3. Review the agreement
4. Click "Purchase on Avalanche"
5. Confirm the MetaMask transaction

### **4. View Your NFT**

- Check your MetaMask wallet
- View transaction on Avalanche Explorer
- NFT will appear in your wallet

---

## 🛠️ **Troubleshooting**

### **"Contract execution reverted"**

- **Cause**: You're not an authorized minter
- **Solution**: Run `npm run add-minter YOUR_WALLET_ADDRESS`

### **"Transaction rejected by user"**

- **Cause**: You cancelled the MetaMask transaction
- **Solution**: Try again and confirm the transaction

### **"Insufficient AVAX balance"**

- **Cause**: Not enough AVAX for gas fees
- **Solution**: Get AVAX from [Avalanche Faucet](https://faucet.avax.network/)

### **"Failed to add Avalanche network"**

- **Cause**: Network not added to MetaMask
- **Solution**: Add network manually:
  - Network Name: Avalanche Fuji Testnet
  - RPC URL: https://api.avax-test.network/ext/bc/C/rpc
  - Chain ID: 43113
  - Currency: AVAX

### **"MetaMask is not installed"**

- **Cause**: MetaMask browser extension not installed
- **Solution**: Install MetaMask from [metamask.io](https://metamask.io/)

---

## 📊 **Features**

### **✅ Working Features**

- ✅ Real NFT minting on Avalanche
- ✅ MetaMask integration
- ✅ Transaction verification
- ✅ Explorer links
- ✅ Gas estimation
- ✅ Error handling
- ✅ Contract authorization

### **🔄 Coming Soon**

- Cross-chain bridging via CCIP
- Ethereum mainnet support
- NFT marketplace trading
- Batch minting
- Metadata on IPFS

---

## 🌐 **Network Details**

### **Avalanche Fuji Testnet**

- **Chain ID**: 43113
- **Currency**: AVAX
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://explorer.avax-test.network
- **Faucet**: https://faucet.avax.network

### **Gas Settings**

- **Gas Limit**: Auto-estimated + 30% buffer
- **Gas Price**: 30 gwei
- **Typical Cost**: ~0.001 AVAX per transaction

---

## 📝 **Contract Functions**

### **Main Functions**

- `mintAirRightsNFT()` - Mint new air rights NFT
- `addAuthorizedMinter()` - Add authorized minter (owner only)
- `authorizedMinters()` - Check if address is authorized
- `owner()` - Get contract owner

### **Requirements**

- Must be authorized minter or contract owner
- Property address must be unique
- Valid height parameters (currentHeight < maximumHeight)

---

## 🎯 **Next Steps**

1. **Test the System**

   ```bash
   npm run add-minter YOUR_WALLET_ADDRESS
   npm run dev
   ```

2. **Try a Purchase**

   - Go to http://localhost:3000/listings
   - Click "Buy Now"
   - Complete the transaction

3. **Verify Success**
   - Check MetaMask wallet for NFT
   - View transaction on Avalanche Explorer
   - Check contract state

---

## 📞 **Support**

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify your wallet has AVAX for gas
3. Make sure you're authorized as a minter
4. Check the console for error messages

**Contract Address**: `0xEF515f802e3026f540BC8654d2B3a475A242a2B9`  
**Network**: Avalanche Fuji Testnet  
**Status**: ✅ Live & Working
