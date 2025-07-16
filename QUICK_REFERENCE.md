# ⚡ QUICK REFERENCE CARD

## 🚀 **FASTEST DEPLOYMENT (2 commands)**

```bash
npm run check-deployment  # Check if ready
npm run quick-deploy      # Deploy everything
```

---

## 🔧 **SETUP COMMANDS**

```bash
npm install                    # Install dependencies
npm run test-setup            # Test configuration
npm run compile               # Compile contracts
npm run check-deployment      # Pre-deployment check
```

---

## 🏗️ **DEPLOYMENT COMMANDS**

```bash
npm run deploy:avalanche-fuji  # Deploy to Avalanche Fuji
npm run quick-deploy          # Automated deployment
```

---

## 🖥️ **SERVER COMMANDS**

```bash
npm run dev                   # Start frontend (port 3000)
npm run server               # Start backend (port 3001)
```

---

## 📋 **MUST HAVE BEFORE DEPLOYMENT**

### **1. Create .env.local file:**

```env
PRIVATE_KEY=0x[your-private-key]
NEXT_PUBLIC_RECIPIENT_ADDRESS=0x[your-wallet-address]
```

### **2. Get your private key:**

- MetaMask → Account Details → Export Private Key

### **3. Get AVAX tokens:**

- https://faucet.avax.network/

---

## 🏔️ **AVALANCHE NETWORK SETTINGS**

Add to MetaMask:

- **Name**: Avalanche Fuji Testnet
- **RPC**: https://api.avax-test.network/ext/bc/C/rpc
- **Chain ID**: 43113
- **Symbol**: AVAX

---

## 🔍 **VERIFICATION LINKS**

After deployment:

- **Explorer**: https://explorer.avax-test.network/
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health**: http://localhost:3001/health

---

## 🚨 **COMMON FIXES**

```bash
# Not enough AVAX
# → Get more from faucet

# Private key error
# → Check .env.local format

# Compilation error
npm install && npm run compile

# Server not working
pkill -f "ts-node" && npm run server
```

---

## 📁 **IMPORTANT FILES**

- `.env.local` - Your private key and wallet address
- `deployments/avalanche-fuji.json` - Contract addresses
- `STEP_BY_STEP_DEPLOYMENT.md` - Full guide
- `DEPLOYMENT_SUMMARY.md` - Quick overview

---

## ✅ **SUCCESS CHECKLIST**

- [ ] `npm run check-deployment` shows all ✅
- [ ] Contracts deployed to Avalanche
- [ ] Explorer links work
- [ ] Frontend loads without errors
- [ ] MetaMask connects successfully

---

**🎯 Ready to deploy in under 5 minutes!**
