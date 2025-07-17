const { ethers } = require('ethers');
require('dotenv').config();

// Contract configuration
const CONTRACT_ADDRESS = '0xEF515f802e3026f540BC8654d2B3a475A242a2B9';
const AVALANCHE_FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';

// Contract ABI (minimal)
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "minter",
        "type": "address"
      }
    ],
    "name": "addAuthorizedMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "authorizedMinters",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function addAuthorizedMinter(minterAddress) {
  try {
    // Check if private key is set
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is not set');
    }

    // Create provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(AVALANCHE_FUJI_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    // Get contract owner
    const owner = await contract.owner();
    console.log('Contract owner:', owner);
    console.log('Your address:', wallet.address);
    
    // Check if you're the owner
    if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
      throw new Error('You are not the contract owner. Only the owner can add authorized minters.');
    }
    
    // Check if already authorized
    const isAlreadyAuthorized = await contract.authorizedMinters(minterAddress);
    if (isAlreadyAuthorized) {
      console.log(`Address ${minterAddress} is already an authorized minter.`);
      return;
    }
    
    // Add authorized minter
    console.log(`Adding ${minterAddress} as authorized minter...`);
    const tx = await contract.addAuthorizedMinter(minterAddress, {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits('30', 'gwei')
    });
    
    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed!');
    console.log('Block number:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    
    // Verify the minter was added
    const isNowAuthorized = await contract.authorizedMinters(minterAddress);
    if (isNowAuthorized) {
      console.log(`✅ Successfully authorized ${minterAddress} as a minter!`);
    } else {
      console.log('❌ Failed to authorize minter');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Get minter address from command line or use default
const minterAddress = process.argv[2] || process.env.WALLET_ADDRESS;

if (!minterAddress) {
  console.error('Please provide a minter address:');
  console.error('npm run add-minter <address>');
  console.error('or set WALLET_ADDRESS environment variable');
  process.exit(1);
}

if (!ethers.utils.isAddress(minterAddress)) {
  console.error('Invalid address format:', minterAddress);
  process.exit(1);
}

console.log('Adding authorized minter...');
console.log('Contract:', CONTRACT_ADDRESS);
console.log('Minter:', minterAddress);
console.log('Network: Avalanche Fuji Testnet');
console.log('');

addAuthorizedMinter(minterAddress); 