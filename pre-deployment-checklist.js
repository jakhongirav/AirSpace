#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('📋 Pre-Deployment Checklist');
console.log('============================\n');

let allGood = true;

// Check 1: .env.local file exists
console.log('1. Checking .env.local file...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env.local file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check private key
  if (envContent.includes('PRIVATE_KEY=0x') && !envContent.includes('your-private-key-will-go-here')) {
    console.log('   ✅ Private key is configured');
  } else {
    console.log('   ❌ Private key needs to be updated');
    allGood = false;
  }
  
  // Check wallet address
  if (envContent.includes('NEXT_PUBLIC_RECIPIENT_ADDRESS=0x') && !envContent.includes('0xYourWalletAddressHere')) {
    console.log('   ✅ Wallet address is configured');
  } else {
    console.log('   ❌ Wallet address needs to be updated');
    allGood = false;
  }
} else {
  console.log('   ❌ .env.local file not found');
  console.log('   Create it using the template in STEP_BY_STEP_DEPLOYMENT.md');
  allGood = false;
}

// Check 2: Dependencies installed
console.log('\n2. Checking dependencies...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('   ✅ Dependencies are installed');
} else {
  console.log('   ❌ Dependencies not installed - run: npm install');
  allGood = false;
}

// Check 3: Hardhat configuration
console.log('\n3. Checking Hardhat configuration...');
if (fs.existsSync(path.join(__dirname, 'hardhat.config.js'))) {
  console.log('   ✅ Hardhat config exists');
} else {
  console.log('   ❌ Hardhat config missing');
  allGood = false;
}

// Check 4: Smart contracts
console.log('\n4. Checking smart contracts...');
const contractsPath = path.join(__dirname, 'src/contracts');
if (fs.existsSync(contractsPath)) {
  const contracts = fs.readdirSync(contractsPath).filter(f => f.endsWith('.sol'));
  if (contracts.length > 0) {
    console.log('   ✅ Smart contracts found:', contracts.join(', '));
  } else {
    console.log('   ❌ No smart contracts found');
    allGood = false;
  }
} else {
  console.log('   ❌ Contracts directory not found');
  allGood = false;
}

// Check 5: Deployment script
console.log('\n5. Checking deployment script...');
const deployScript = path.join(__dirname, 'scripts/deploy-avalanche.js');
if (fs.existsSync(deployScript)) {
  console.log('   ✅ Deployment script exists');
} else {
  console.log('   ❌ Deployment script missing');
  allGood = false;
}

// Check 6: MetaMask setup instructions
console.log('\n6. MetaMask setup (manual check required)...');
console.log('   📝 Please verify manually:');
console.log('   - MetaMask is installed and unlocked');
console.log('   - Avalanche Fuji network is added to MetaMask');
console.log('   - Your wallet has at least 0.5 AVAX for gas fees');
console.log('   - You have your private key and wallet address');

// Final summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 ALL CHECKS PASSED! You are ready for deployment.');
  console.log('\n📝 Next Steps:');
  console.log('1. Make sure you have AVAX tokens in your wallet');
  console.log('2. Run: npm run quick-deploy');
  console.log('3. Or follow the manual guide in STEP_BY_STEP_DEPLOYMENT.md');
} else {
  console.log('❌ Some checks failed. Please fix the issues above before deploying.');
  console.log('\n📝 Common Solutions:');
  console.log('- Create .env.local file with your private key and wallet address');
  console.log('- Run: npm install');
  console.log('- Check STEP_BY_STEP_DEPLOYMENT.md for detailed instructions');
}

console.log('\n🔗 Useful Links:');
console.log('- Avalanche Faucet: https://faucet.avax.network/');
console.log('- Avalanche Explorer: https://explorer.avax-test.network/');
console.log('- Add Avalanche to MetaMask: https://support.avax.network/en/articles/4626956-how-do-i-set-up-metamask-on-avalanche');

process.exit(allGood ? 0 : 1); 