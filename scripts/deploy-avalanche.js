const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🏔️ Deploying AirSpace contracts to Avalanche...");
  
  // Check if private key is configured
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY environment variable is not set!");
    console.error("📝 Please follow these steps:");
    console.error("1. Create a .env file in your project root");
    console.error("2. Add: PRIVATE_KEY=your_private_key_here");
    console.error("3. Get your private key from MetaMask:");
    console.error("   - Open MetaMask → Account Details → Export Private Key");
    console.error("   - Remove the '0x' prefix from the key");
    console.error("4. Get testnet AVAX from: https://faucet.avax.network/");
    console.error("5. Run the deployment again");
    process.exit(1);
  }
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "| Chain ID:", network.chainId);
  
  // Get deployer account
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    console.error("❌ No signers found! Please check your PRIVATE_KEY in .env file");
    process.exit(1);
  }
  
  const [deployer] = signers;
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "AVAX");
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.error("❌ Insufficient balance! Need at least 0.1 AVAX for deployment");
    console.error("💰 Get testnet AVAX from: https://faucet.avax.network/");
    console.error("🏠 Your address:", deployer.address);
    process.exit(1);
  }
  
  // Contract addresses for Avalanche Fuji
  const AVALANCHE_FUJI_CCIP_ROUTER = "0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8";
  const AVALANCHE_FUJI_LINK_TOKEN = "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846";
  
  // Contract addresses for Avalanche Mainnet
  const AVALANCHE_MAINNET_CCIP_ROUTER = "0x27F39D0af3303703750D4001fCc1844c6491563c";
  const AVALANCHE_MAINNET_LINK_TOKEN = "0x5947BB275c521040051D82396192181b413227A3";
  
  // Choose addresses based on network
  const isMainnet = network.chainId === 43114;
  const ccipRouter = isMainnet ? AVALANCHE_MAINNET_CCIP_ROUTER : AVALANCHE_FUJI_CCIP_ROUTER;
  const linkToken = isMainnet ? AVALANCHE_MAINNET_LINK_TOKEN : AVALANCHE_FUJI_LINK_TOKEN;
  
  console.log("Using CCIP Router:", ccipRouter);
  console.log("Using LINK Token:", linkToken);
  
  const deployedContracts = {};
  
  try {
    // 1. Deploy CCIP Receiver
    console.log("\n1️⃣ Deploying AirSpaceCCIPReceiver...");
    const AirSpaceCCIPReceiver = await ethers.getContractFactory("AirSpaceCCIPReceiver");
    const ccipReceiver = await AirSpaceCCIPReceiver.deploy(
      ccipRouter,
      deployer.address  // Payment recipient address
    );
    await ccipReceiver.deployed();
    deployedContracts.ccipReceiver = ccipReceiver.address;
    console.log("✅ CCIP Receiver deployed to:", ccipReceiver.address);
    
    // 2. Deploy CCIP Sender
    console.log("\n2️⃣ Deploying AirSpaceCCIPSender...");
    const AirSpaceCCIPSender = await ethers.getContractFactory("AirSpaceCCIPSender");
    const ccipSender = await AirSpaceCCIPSender.deploy(
      ccipRouter,
      linkToken
    );
    await ccipSender.deployed();
    deployedContracts.ccipSender = ccipSender.address;
    console.log("✅ CCIP Sender deployed to:", ccipSender.address);
    
    // 3. Deploy NFT Contract
    console.log("\n3️⃣ Deploying PolkadotAirSpaceNFT...");
    const PolkadotAirSpaceNFT = await ethers.getContractFactory("PolkadotAirSpaceNFT");
    const nftContract = await PolkadotAirSpaceNFT.deploy(
      deployer.address  // Treasury address for platform fees
    );
    await nftContract.deployed();
    deployedContracts.nftContract = nftContract.address;
    console.log("✅ NFT Contract deployed to:", nftContract.address);
    
    // 4. Deploy ZkSync ETH Transfer (if exists)
    try {
      console.log("\n4️⃣ Deploying ZkSyncETHTransfer...");
      const ZkSyncETHTransfer = await ethers.getContractFactory("ZkSyncETHTransfer");
      const zkSyncContract = await ZkSyncETHTransfer.deploy();
      await zkSyncContract.deployed();
      deployedContracts.zkSyncContract = zkSyncContract.address;
      console.log("✅ ZkSync Contract deployed to:", zkSyncContract.address);
    } catch (error) {
      console.log("⚠️ ZkSyncETHTransfer not found, skipping...");
    }
    
    // Prepare deployment summary
    const deploymentSummary = {
      network: network.name,
      chainId: network.chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      explorerUrls: {
        ccipReceiver: `https://${isMainnet ? 'explorer.avax.network' : 'explorer.avax-test.network'}/address/${deployedContracts.ccipReceiver}`,
        ccipSender: `https://${isMainnet ? 'explorer.avax.network' : 'explorer.avax-test.network'}/address/${deployedContracts.ccipSender}`,
        nftContract: `https://${isMainnet ? 'explorer.avax.network' : 'explorer.avax-test.network'}/address/${deployedContracts.nftContract}`,
      }
    };
    
    if (deployedContracts.zkSyncContract) {
      deploymentSummary.explorerUrls.zkSyncContract = `https://${isMainnet ? 'explorer.avax.network' : 'explorer.avax-test.network'}/address/${deployedContracts.zkSyncContract}`;
    }
    
    // Save deployment info
    const deploymentFile = `deployments/avalanche-${isMainnet ? 'mainnet' : 'fuji'}.json`;
    fs.mkdirSync('deployments', { recursive: true });
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentSummary, null, 2));
    
    console.log("\n🎉 Deployment Complete!");
    console.log("📄 Deployment summary saved to:", deploymentFile);
    console.log("\n📋 Contract Addresses:");
    console.log("├── CCIP Receiver:", deployedContracts.ccipReceiver);
    console.log("├── CCIP Sender:", deployedContracts.ccipSender);
    console.log("├── NFT Contract:", deployedContracts.nftContract);
    if (deployedContracts.zkSyncContract) {
      console.log("└── ZkSync Contract:", deployedContracts.zkSyncContract);
    }
    
    console.log("\n🔍 View on Avalanche Explorer:");
    console.log("├── CCIP Receiver:", deploymentSummary.explorerUrls.ccipReceiver);
    console.log("├── CCIP Sender:", deploymentSummary.explorerUrls.ccipSender);
    console.log("├── NFT Contract:", deploymentSummary.explorerUrls.nftContract);
    if (deploymentSummary.explorerUrls.zkSyncContract) {
      console.log("└── ZkSync Contract:", deploymentSummary.explorerUrls.zkSyncContract);
    }
    
    console.log("\n📝 Next Steps:");
    console.log("1. View contracts on Avalanche Explorer (links above)");
    console.log("2. Update frontend configuration with these addresses");
    console.log("3. Test cross-chain functionality");
    console.log("4. Deploy frontend to Vercel");
    console.log("5. Submit to hackathon with live demo");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
}); 