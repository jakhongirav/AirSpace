import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { NFT } from "@/types/nft";

// Get MetaMask provider safely
const getMetaMaskProvider = (): any => {
  if (typeof window === "undefined") return null;

  // If ethereum object exists and is MetaMask
  if (window.ethereum?.isMetaMask) {
    return window.ethereum;
  }

  // If ethereum has providers array, find MetaMask
  if (window.ethereum?.providers) {
    return window.ethereum.providers.find(
      (provider: any) => provider.isMetaMask
    );
  }

  return null;
};

// Contract addresses on Avalanche Fuji
const AVALANCHE_CONTRACTS = {
  NFT_CONTRACT: "0xEF515f802e3026f540BC8654d2B3a475A242a2B9",
  CCIP_RECEIVER: "0x76444fe6d30F3f0D01654D3561d5Cd982ffc904c",
  CCIP_SENDER: "0x3b0978cFF8370697A8BD15bAa8BB45a98CB75926",
  ZK_SYNC_CONTRACT: "0x5bB4E5fE41cEC088734aAC50e30C14742674cb5e",
};

// Avalanche Fuji testnet configuration
const AVALANCHE_FUJI = {
  chainId: 43113,
  name: "Avalanche Fuji Testnet",
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  blockExplorerUrl: "https://explorer.avax-test.network",
  currency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18,
  },
};

// Extended ABI with all necessary functions
const NFT_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "string",
        name: "propertyAddress",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "currentHeight",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maximumHeight",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "metadataURI",
        type: "string",
      },
    ],
    name: "mintAirRightsNFT",
    outputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "minter",
        type: "address",
      },
    ],
    name: "addAuthorizedMinter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "authorizedMinters",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "propertyToTokenId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Check if user is connected to Avalanche Fuji
export const checkAvalancheNetwork = async (): Promise<boolean> => {
  const provider = getMetaMaskProvider();
  if (!provider) {
    throw new Error("MetaMask is not installed");
  }

  try {
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const network = await ethersProvider.getNetwork();
    return network.chainId === AVALANCHE_FUJI.chainId;
  } catch (error) {
    console.error("Error checking network:", error);
    return false;
  }
};

// Switch to Avalanche Fuji network
export const switchToAvalanche = async (): Promise<void> => {
  const provider = getMetaMaskProvider();
  if (!provider) {
    throw new Error("MetaMask is not installed");
  }

  try {
    // Try to switch to Avalanche Fuji
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${AVALANCHE_FUJI.chainId.toString(16)}` }],
    });
  } catch (switchError: any) {
    // If network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${AVALANCHE_FUJI.chainId.toString(16)}`,
              chainName: AVALANCHE_FUJI.name,
              rpcUrls: [AVALANCHE_FUJI.rpcUrl],
              blockExplorerUrls: [AVALANCHE_FUJI.blockExplorerUrl],
              nativeCurrency: AVALANCHE_FUJI.currency,
            },
          ],
        });
      } catch (addError) {
        console.error("Error adding network:", addError);
        throw new Error("Failed to add Avalanche network to MetaMask");
      }
    } else {
      console.error("Error switching network:", switchError);
      throw new Error("Failed to switch to Avalanche network");
    }
  }
};

// Check if user is authorized minter
export const checkAuthorizedMinter = async (
  userAddress: string
): Promise<boolean> => {
  try {
    const provider = getMetaMaskProvider();
    if (!provider) {
      throw new Error("MetaMask is not installed");
    }

    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const nftContract = new ethers.Contract(
      AVALANCHE_CONTRACTS.NFT_CONTRACT,
      NFT_CONTRACT_ABI,
      ethersProvider
    );

    const isAuthorized = await nftContract.authorizedMinters(userAddress);
    const owner = await nftContract.owner();

    return isAuthorized || userAddress.toLowerCase() === owner.toLowerCase();
  } catch (error) {
    console.error("Error checking authorized minter:", error);
    return false;
  }
};

// Add user as authorized minter (only owner can do this)
export const addAuthorizedMinter = async (
  userAddress: string
): Promise<void> => {
  try {
    const provider = getMetaMaskProvider();
    if (!provider) {
      throw new Error("MetaMask is not installed");
    }

    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const nftContract = new ethers.Contract(
      AVALANCHE_CONTRACTS.NFT_CONTRACT,
      NFT_CONTRACT_ABI,
      signer
    );

    const tx = await nftContract.addAuthorizedMinter(userAddress);
    await tx.wait();

    console.log("User added as authorized minter:", userAddress);
  } catch (error) {
    console.error("Error adding authorized minter:", error);
    throw new Error(
      "Failed to add authorized minter. You must be the contract owner."
    );
  }
};

// Check if property already exists
export const checkPropertyExists = async (
  propertyAddress: string
): Promise<boolean> => {
  try {
    const provider = getMetaMaskProvider();
    if (!provider) {
      throw new Error("MetaMask is not installed");
    }

    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const nftContract = new ethers.Contract(
      AVALANCHE_CONTRACTS.NFT_CONTRACT,
      NFT_CONTRACT_ABI,
      provider
    );

    const tokenId = await nftContract.propertyToTokenId(propertyAddress);
    return tokenId.gt(0);
  } catch (error) {
    console.error("Error checking property existence:", error);
    return false;
  }
};

// Mint NFT on Avalanche with proper authorization handling
export const mintNFTOnAvalanche = async (
  nft: NFT,
  userAddress: string
): Promise<{
  transactionHash: string;
  tokenId: number;
  blockNumber: number;
  gasUsed: string;
  explorerUrl: string;
}> => {
  try {
    // Check if MetaMask is available
    const provider = getMetaMaskProvider();
    if (!provider) {
      throw new Error("MetaMask is not installed");
    }

    // Ensure we're on Avalanche Fuji
    const isCorrectNetwork = await checkAvalancheNetwork();
    if (!isCorrectNetwork) {
      toast.loading("Switching to Avalanche Fuji network...");
      await switchToAvalanche();
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for network switch
    }

    // Create provider and signer
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();

    // Create contract instance
    const nftContract = new ethers.Contract(
      AVALANCHE_CONTRACTS.NFT_CONTRACT,
      NFT_CONTRACT_ABI,
      signer
    );

    // Check if user is authorized minter
    const isAuthorized = await checkAuthorizedMinter(userAddress);
    if (!isAuthorized) {
      throw new Error(
        "You are not authorized to mint NFTs. Please contact the contract owner to add you as an authorized minter."
      );
    }

    // Create unique property address to avoid duplicates
    const uniquePropertyAddress = `${nft.propertyAddress}-${Date.now()}`;

    // Check if property already exists
    const propertyExists = await checkPropertyExists(uniquePropertyAddress);
    if (propertyExists) {
      throw new Error("Property already exists. Please try again.");
    }

    // Prepare transaction parameters
    const priceInWei = ethers.utils.parseEther("0.001"); // Fixed small price for testing
    const metadataURI = `https://airspace.com/nft/metadata/${nft.id}`;

    console.log("Minting NFT with parameters:", {
      to: userAddress,
      propertyAddress: uniquePropertyAddress,
      currentHeight: nft.currentHeight,
      maximumHeight: nft.maximumHeight,
      price: priceInWei.toString(),
      metadataURI,
    });

    // Estimate gas
    const gasEstimate = await nftContract.estimateGas.mintAirRightsNFT(
      userAddress,
      uniquePropertyAddress,
      nft.currentHeight,
      nft.maximumHeight,
      priceInWei,
      metadataURI
    );

    console.log("Gas estimate:", gasEstimate.toString());

    // Execute transaction with proper gas settings
    const tx = await nftContract.mintAirRightsNFT(
      userAddress,
      uniquePropertyAddress,
      nft.currentHeight,
      nft.maximumHeight,
      priceInWei,
      metadataURI,
      {
        gasLimit: gasEstimate.mul(130).div(100), // Add 30% buffer
        gasPrice: ethers.utils.parseUnits("30", "gwei"),
      }
    );

    console.log("Transaction sent:", tx.hash);
    toast.success("Transaction sent! Waiting for confirmation...");

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    // Extract token ID from events
    const mintEvent = receipt.events?.find(
      (event: any) =>
        event.event === "Transfer" &&
        event.args?.from === ethers.constants.AddressZero
    );

    const tokenId = mintEvent?.args?.tokenId?.toNumber() || 0;

    return {
      transactionHash: receipt.transactionHash,
      tokenId,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      explorerUrl: `${AVALANCHE_FUJI.blockExplorerUrl}/tx/${receipt.transactionHash}`,
    };
  } catch (error: any) {
    console.error("Error minting NFT on Avalanche:", error);

    // Handle specific error cases
    if (error.code === 4001) {
      throw new Error("Transaction rejected by user");
    } else if (error.code === -32603) {
      throw new Error("Internal JSON-RPC error. Please try again.");
    } else if (error.message?.includes("insufficient funds")) {
      throw new Error(
        "Insufficient AVAX balance for gas fees. Please add AVAX to your wallet."
      );
    } else if (error.message?.includes("execution reverted")) {
      if (error.message.includes("PropertyAlreadyExists")) {
        throw new Error(
          "This property already has an NFT. Please try a different property."
        );
      } else if (error.message.includes("InvalidMinter")) {
        throw new Error(
          "You are not authorized to mint NFTs. Please contact the contract owner."
        );
      } else {
        throw new Error(
          "Transaction failed: The contract rejected the transaction. Please check the property details and try again."
        );
      }
    } else {
      throw new Error(error.message || "Failed to mint NFT on Avalanche");
    }
  }
};

// Get contract info
export const getContractInfo = async () => {
  try {
    const provider = getMetaMaskProvider();
    if (!provider) {
      throw new Error("MetaMask is not installed");
    }

    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const nftContract = new ethers.Contract(
      AVALANCHE_CONTRACTS.NFT_CONTRACT,
      NFT_CONTRACT_ABI,
      ethersProvider
    );

    const owner = await nftContract.owner();
    return {
      contractAddress: AVALANCHE_CONTRACTS.NFT_CONTRACT,
      owner,
      explorerUrl: `${AVALANCHE_FUJI.blockExplorerUrl}/address/${AVALANCHE_CONTRACTS.NFT_CONTRACT}`,
    };
  } catch (error) {
    console.error("Error getting contract info:", error);
    return null;
  }
};

// Get contract addresses
export const getContractAddresses = () => AVALANCHE_CONTRACTS;

// Get network configuration
export const getNetworkConfig = () => AVALANCHE_FUJI;

// Export service object
const avalancheService = {
  checkAvalancheNetwork,
  switchToAvalanche,
  checkAuthorizedMinter,
  addAuthorizedMinter,
  checkPropertyExists,
  mintNFTOnAvalanche,
  getContractInfo,
  getContractAddresses,
  getNetworkConfig,
};

export default avalancheService;
