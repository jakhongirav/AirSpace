import { config } from "@onflow/fcl";

// Mock function to simulate ZK proof verification (always returns true)
const verifyWithZkVerify = async (proofData: any) => {
  console.log("Verifying proof with zkVerify:", proofData);
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Always return true to ensure verification succeeds
  return true;
};

// Generate a mock proof for demonstration purposes
const generateProof = (data: any) => {
  return {
    id: `proof-${Date.now()}`,
    system: "groth16",
    data: JSON.stringify(data),
    timestamp: new Date().toISOString(),
  };
};

// Flow blockchain configuration
const flowConfig = {
  NETWORK: "testnet",
  FLOW_ACCESS_NODE:
    process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE ||
    "https://rest-testnet.onflow.org",
  FLOW_WALLET_DISCOVERY: "https://fcl-discovery.onflow.org/testnet/authn",
  APP_NAME: "AirSpace NFT Marketplace",
  APP_ICON: "https://airspace.com/icon.png",
  APP_DESCRIPTION: "Decentralized Air Rights Trading Platform",
  FLOW_TOKEN_ADDRESS: "0x7e60df042a9c0868",
  NON_FUNGIBLE_TOKEN_ADDRESS: "0x631e88ae7f1d7c20",
  METADATA_VIEWS_ADDRESS: "0x631e88ae7f1d7c20",
  AIRSPACE_NFT_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_FLOW_NFT_CONTRACT || "0x1234567890abcdef",
  DEFAULT_GAS_LIMIT: 999,
  FLOW_TX_STATUS: {
    SEALED: 4,
  },
  zkVerify: {
    supportedSystems: ["groth16", "plonk"],
    generateProof: (data: any) => ({
      id: `proof-${Date.now()}`,
      system: "groth16",
      data: JSON.stringify(data),
      timestamp: new Date().toISOString(),
    }),
  },
};

// Configure FCL
config()
  .put("accessNode.api", flowConfig.FLOW_ACCESS_NODE)
  .put("discovery.wallet", flowConfig.FLOW_WALLET_DISCOVERY)
  .put("app.detail.title", flowConfig.APP_NAME)
  .put("app.detail.icon", flowConfig.APP_ICON)
  .put("app.detail.description", flowConfig.APP_DESCRIPTION)
  .put("0xFlowToken", flowConfig.FLOW_TOKEN_ADDRESS)
  .put("0xNonFungibleToken", flowConfig.NON_FUNGIBLE_TOKEN_ADDRESS)
  .put("0xMetadataViews", flowConfig.METADATA_VIEWS_ADDRESS)
  .put("0xAirSpaceNFT", flowConfig.AIRSPACE_NFT_CONTRACT_ADDRESS);

export default flowConfig;
