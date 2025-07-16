const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing AirSpace Setup...\n');

// Test 1: Check if .env.local exists
console.log('1. Checking .env.local file...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  
  // Check if it has the required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'PRIVATE_KEY',
    'NEXT_PUBLIC_RECIPIENT_ADDRESS',
    'NEXT_PUBLIC_AVALANCHE_RPC_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('✅ Required environment variables are present');
  } else {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('   Please create it using the template in URGENT_FIXES_NEEDED.md');
}

// Test 2: Check if node_modules are installed
console.log('\n2. Checking dependencies...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('✅ Dependencies are installed');
} else {
  console.log('❌ Dependencies not installed. Run: npm install');
}

// Test 3: Check if hardhat config exists
console.log('\n3. Checking Hardhat configuration...');
if (fs.existsSync(path.join(__dirname, 'hardhat.config.js'))) {
  console.log('✅ Hardhat config exists');
} else {
  console.log('❌ Hardhat config missing');
}

// Test 4: Check if contracts exist
console.log('\n4. Checking smart contracts...');
const contractsPath = path.join(__dirname, 'src/contracts');
if (fs.existsSync(contractsPath)) {
  const contracts = fs.readdirSync(contractsPath).filter(f => f.endsWith('.sol'));
  console.log('✅ Found contracts:', contracts.join(', '));
} else {
  console.log('❌ Contracts directory not found');
}

// Test 5: Check if scripts exist
console.log('\n5. Checking deployment scripts...');
const scriptsPath = path.join(__dirname, 'scripts');
if (fs.existsSync(scriptsPath)) {
  const scripts = fs.readdirSync(scriptsPath).filter(f => f.endsWith('.js'));
  console.log('✅ Found scripts:', scripts.join(', '));
} else {
  console.log('❌ Scripts directory not found');
}

// Test 6: Test server health
console.log('\n6. Testing server health...');
exec('curl -f http://localhost:3001/health 2>/dev/null || echo "Server not running"', (error, stdout, stderr) => {
  if (stdout.includes('status')) {
    console.log('✅ Server is running and healthy');
  } else {
    console.log('❌ Server is not running. Start it with: npm run server');
  }
});

// Test 7: Test compilation
console.log('\n7. Testing contract compilation...');
exec('npx hardhat compile', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Compilation failed:', error.message);
  } else {
    console.log('✅ Contracts compiled successfully');
  }
});

console.log('\n🎯 Setup Test Complete!');
console.log('\nNext steps:');
console.log('1. Fix any ❌ issues above');
console.log('2. Get AVAX tokens from faucet');
console.log('3. Deploy contracts: npm run deploy:avalanche-fuji');
console.log('4. Update contract addresses in .env.local');
console.log('5. Start development: npm run dev'); 