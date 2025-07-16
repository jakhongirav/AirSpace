#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AirSpace Quick Deployment Script');
console.log('=====================================\n');

// Step 1: Check environment
console.log('1. Checking environment...');
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Please create .env.local file first using the template in STEP_BY_STEP_DEPLOYMENT.md');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('PRIVATE_KEY=0x') || envContent.includes('your-private-key-will-go-here')) {
  console.log('❌ Please update PRIVATE_KEY in .env.local');
  process.exit(1);
}

if (!envContent.includes('NEXT_PUBLIC_RECIPIENT_ADDRESS=0x') || envContent.includes('0xYourWalletAddressHere')) {
  console.log('❌ Please update NEXT_PUBLIC_RECIPIENT_ADDRESS in .env.local');
  process.exit(1);
}

console.log('✅ Environment file validated');

// Step 2: Install dependencies
console.log('\n2. Installing dependencies...');
exec('npm install', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Dependency installation failed:', error);
    return;
  }
  console.log('✅ Dependencies installed');
  
  // Step 3: Compile contracts
  console.log('\n3. Compiling contracts...');
  exec('npm run compile', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Compilation failed:', error);
      return;
    }
    console.log('✅ Contracts compiled');
    
    // Step 4: Deploy to Avalanche
    console.log('\n4. Deploying to Avalanche Fuji...');
    exec('npm run deploy:avalanche-fuji', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Deployment failed:', error);
        console.log('Please check:');
        console.log('- You have enough AVAX tokens');
        console.log('- Your private key is correct');
        console.log('- You are connected to the internet');
        return;
      }
      
      console.log('✅ Deployment successful!');
      console.log(stdout);
      
      // Step 5: Update environment variables
      console.log('\n5. Updating environment variables...');
      try {
        const deploymentPath = path.join(__dirname, 'deployments', 'avalanche-fuji.json');
        if (fs.existsSync(deploymentPath)) {
          const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
          
          let updatedEnv = envContent;
          updatedEnv = updatedEnv.replace(
            /NEXT_PUBLIC_AVALANCHE_CCIP_RECEIVER=.*/,
            `NEXT_PUBLIC_AVALANCHE_CCIP_RECEIVER=${deployment.contracts.ccipReceiver}`
          );
          updatedEnv = updatedEnv.replace(
            /NEXT_PUBLIC_AVALANCHE_CCIP_SENDER=.*/,
            `NEXT_PUBLIC_AVALANCHE_CCIP_SENDER=${deployment.contracts.ccipSender}`
          );
          updatedEnv = updatedEnv.replace(
            /NEXT_PUBLIC_AVALANCHE_NFT_CONTRACT=.*/,
            `NEXT_PUBLIC_AVALANCHE_NFT_CONTRACT=${deployment.contracts.nftContract}`
          );
          
          fs.writeFileSync(envPath, updatedEnv);
          console.log('✅ Environment variables updated');
          
          // Step 6: Final summary
          console.log('\n🎉 DEPLOYMENT COMPLETE!');
          console.log('=======================');
          console.log('📋 Contract Addresses:');
          console.log('├── CCIP Receiver:', deployment.contracts.ccipReceiver);
          console.log('├── CCIP Sender:', deployment.contracts.ccipSender);
          console.log('├── NFT Contract:', deployment.contracts.nftContract);
          console.log('\n🔍 View on Avalanche Explorer:');
          console.log('├── CCIP Receiver:', deployment.explorerUrls.ccipReceiver);
          console.log('├── CCIP Sender:', deployment.explorerUrls.ccipSender);
          console.log('├── NFT Contract:', deployment.explorerUrls.nftContract);
          console.log('\n📝 Next Steps:');
          console.log('1. Start development server: npm run dev');
          console.log('2. Start backend server: npm run server');
          console.log('3. Test application at: http://localhost:3000');
          console.log('4. Create demo video');
          console.log('5. Submit to hackathon');
          
        } else {
          console.log('⚠️ Deployment file not found, please update .env.local manually');
        }
      } catch (error) {
        console.log('⚠️ Error updating environment variables:', error);
        console.log('Please update .env.local manually with the contract addresses shown above');
      }
    });
  });
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Deployment interrupted');
  process.exit(0);
}); 