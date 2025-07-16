// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PolkadotAirSpaceNFT
 * @dev ERC721 NFT contract for air rights on Polkadot Paseo testnet
 * This contract is designed to work with Chainlink CCIP for cross-chain functionality
 * 
 * Features:
 * - Air rights property NFTs with metadata
 * - Cross-chain compatibility via CCIP
 * - Payment processing in DOT/native tokens
 * - Enumerable for easy querying
 * - URI storage for metadata
 */
contract PolkadotAirSpaceNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    
    // Custom errors
    error InvalidPrice(uint256 provided, uint256 required);
    error PropertyAlreadyExists(string propertyAddress);
    error InvalidPropertyData();
    error TransferFailed();
    error NotAuthorized(address caller);
    error InvalidMinter(address minter);

    // Events
    event AirRightsNFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string propertyAddress,
        uint256 currentHeight,
        uint256 maximumHeight,
        uint256 availableFloors,
        uint256 price,
        string metadataURI
    );

    event CrossChainNFTReceived(
        uint256 indexed tokenId,
        address indexed recipient,
        uint64 sourceChainSelector,
        bytes32 sourceMessageId,
        string propertyAddress
    );

    event PaymentReceived(
        address indexed payer,
        uint256 amount,
        uint256 indexed tokenId,
        string paymentType
    );

    event PropertyPriceUpdated(
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice
    );

    // Struct to hold property data
    struct PropertyData {
        string propertyAddress;
        uint256 currentHeight;
        uint256 maximumHeight;
        uint256 availableFloors;
        uint256 price; // in Wei (smallest unit)
        string metadataURI;
        bool exists;
        uint64 sourceChainSelector; // For cross-chain NFTs
        bytes32 sourceMessageId; // CCIP message ID if cross-chain
    }

    // State variables
    uint256 private _tokenIdCounter;
    address public treasury;
    uint256 public platformFeePercent = 250; // 2.5% in basis points
    
    // Authorized minters (for cross-chain functionality)
    mapping(address => bool) public authorizedMinters;
    
    // Property address to token ID mapping
    mapping(string => uint256) public propertyToTokenId;
    
    // Token ID to property data mapping
    mapping(uint256 => PropertyData) public tokenIdToProperty;
    
    // Cross-chain tracking
    mapping(bytes32 => uint256) public ccipMessageToTokenId;
    
    // Payment tracking
    mapping(uint256 => uint256) public totalPaymentsReceived;

    // Modifiers
    modifier onlyAuthorizedMinter() {
        if (!authorizedMinters[msg.sender] && msg.sender != owner()) {
            revert InvalidMinter(msg.sender);
        }
        _;
    }

    modifier validPropertyData(string memory propertyAddress, uint256 currentHeight, uint256 maximumHeight) {
        if (bytes(propertyAddress).length == 0 || maximumHeight <= currentHeight) {
            revert InvalidPropertyData();
        }
        _;
    }

    /**
     * @dev Constructor initializes the contract
     * @param _treasury Address to receive platform fees
     */
    constructor(address _treasury) ERC721("Polkadot AirSpace NFT", "PASNFT") Ownable(msg.sender) {
        treasury = _treasury;
        _tokenIdCounter = 1;
    }

    /**
     * @dev Add an authorized minter (for cross-chain contracts)
     * @param minter Address to authorize
     */
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    /**
     * @dev Remove an authorized minter
     * @param minter Address to remove authorization
     */
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }

    /**
     * @dev Set the treasury address
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    /**
     * @dev Set the platform fee percentage
     * @param _feePercent New fee percentage in basis points (e.g., 250 = 2.5%)
     */
    function setPlatformFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercent = _feePercent;
    }

    /**
     * @dev Mint a new air rights NFT
     * @param to Address to mint to
     * @param propertyAddress The property address
     * @param currentHeight Current building height
     * @param maximumHeight Maximum allowed height
     * @param price Price in Wei
     * @param metadataURI IPFS or other metadata URI
     * @return tokenId The minted token ID
     */
    function mintAirRightsNFT(
        address to,
        string memory propertyAddress,
        uint256 currentHeight,
        uint256 maximumHeight,
        uint256 price,
        string memory metadataURI
    ) external onlyAuthorizedMinter validPropertyData(propertyAddress, currentHeight, maximumHeight) returns (uint256 tokenId) {
        
        // Check if property already exists
        if (propertyToTokenId[propertyAddress] != 0) {
            revert PropertyAlreadyExists(propertyAddress);
        }

        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Calculate available floors
        uint256 availableFloors = maximumHeight - currentHeight;

        // Store property data
        tokenIdToProperty[tokenId] = PropertyData({
            propertyAddress: propertyAddress,
            currentHeight: currentHeight,
            maximumHeight: maximumHeight,
            availableFloors: availableFloors,
            price: price,
            metadataURI: metadataURI,
            exists: true,
            sourceChainSelector: 0, // Native mint
            sourceMessageId: bytes32(0)
        });

        // Map property to token ID
        propertyToTokenId[propertyAddress] = tokenId;

        // Mint the NFT
        _safeMint(to, tokenId);
        
        // Set metadata URI
        if (bytes(metadataURI).length > 0) {
            _setTokenURI(tokenId, metadataURI);
        }

        emit AirRightsNFTMinted(
            tokenId,
            to,
            propertyAddress,
            currentHeight,
            maximumHeight,
            availableFloors,
            price,
            metadataURI
        );

        return tokenId;
    }

    /**
     * @dev Mint a cross-chain NFT (called by CCIP receiver)
     * @param to Address to mint to
     * @param propertyAddress The property address
     * @param currentHeight Current building height
     * @param maximumHeight Maximum allowed height
     * @param price Price in Wei
     * @param metadataURI IPFS or other metadata URI
     * @param sourceChainSelector Source chain selector
     * @param sourceMessageId CCIP message ID
     * @return tokenId The minted token ID
     */
    function mintCrossChainNFT(
        address to,
        string memory propertyAddress,
        uint256 currentHeight,
        uint256 maximumHeight,
        uint256 price,
        string memory metadataURI,
        uint64 sourceChainSelector,
        bytes32 sourceMessageId
    ) external onlyAuthorizedMinter validPropertyData(propertyAddress, currentHeight, maximumHeight) returns (uint256 tokenId) {
        
        // For cross-chain NFTs, we allow duplicates but track the source
        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Calculate available floors
        uint256 availableFloors = maximumHeight - currentHeight;

        // Store property data with cross-chain info
        tokenIdToProperty[tokenId] = PropertyData({
            propertyAddress: propertyAddress,
            currentHeight: currentHeight,
            maximumHeight: maximumHeight,
            availableFloors: availableFloors,
            price: price,
            metadataURI: metadataURI,
            exists: true,
            sourceChainSelector: sourceChainSelector,
            sourceMessageId: sourceMessageId
        });

        // Map CCIP message to token ID
        ccipMessageToTokenId[sourceMessageId] = tokenId;

        // Mint the NFT
        _safeMint(to, tokenId);
        
        // Set metadata URI
        if (bytes(metadataURI).length > 0) {
            _setTokenURI(tokenId, metadataURI);
        }

        emit CrossChainNFTReceived(
            tokenId,
            to,
            sourceChainSelector,
            sourceMessageId,
            propertyAddress
        );

        return tokenId;
    }

    /**
     * @dev Purchase an NFT with native tokens (DOT)
     * @param tokenId The token ID to purchase
     */
    function purchaseWithNativeToken(uint256 tokenId) external payable nonReentrant {
        PropertyData storage property = tokenIdToProperty[tokenId];
        
        if (!property.exists) {
            revert InvalidPropertyData();
        }

        if (msg.value < property.price) {
            revert InvalidPrice(msg.value, property.price);
        }

        address currentOwner = ownerOf(tokenId);
        
        // Calculate platform fee
        uint256 platformFee = (property.price * platformFeePercent) / 10000;
        uint256 sellerAmount = property.price - platformFee;

        // Transfer to seller
        (bool sellerSuccess, ) = payable(currentOwner).call{value: sellerAmount}("");
        if (!sellerSuccess) {
            revert TransferFailed();
        }

        // Transfer platform fee to treasury
        if (platformFee > 0 && treasury != address(0)) {
            (bool treasurySuccess, ) = payable(treasury).call{value: platformFee}("");
            if (!treasurySuccess) {
                revert TransferFailed();
            }
        }

        // Handle excess payment (refund)
        uint256 excess = msg.value - property.price;
        if (excess > 0) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: excess}("");
            if (!refundSuccess) {
                revert TransferFailed();
            }
        }

        // Track payment
        totalPaymentsReceived[tokenId] += property.price;

        // Transfer NFT
        _transfer(currentOwner, msg.sender, tokenId);

        emit PaymentReceived(msg.sender, property.price, tokenId, "NATIVE");
    }

    /**
     * @dev Update the price of a property (only owner)
     * @param tokenId The token ID
     * @param newPrice New price in Wei
     */
    function updatePropertyPrice(uint256 tokenId, uint256 newPrice) external {
        if (ownerOf(tokenId) != msg.sender) {
            revert NotAuthorized(msg.sender);
        }

        PropertyData storage property = tokenIdToProperty[tokenId];
        uint256 oldPrice = property.price;
        property.price = newPrice;

        emit PropertyPriceUpdated(tokenId, oldPrice, newPrice);
    }

    /**
     * @dev Get property data for a token ID
     * @param tokenId The token ID
     * @return property The property data
     */
    function getPropertyData(uint256 tokenId) external view returns (PropertyData memory property) {
        return tokenIdToProperty[tokenId];
    }

    /**
     * @dev Get token ID for a property address
     * @param propertyAddress The property address
     * @return tokenId The token ID (0 if not found)
     */
    function getTokenIdByProperty(string memory propertyAddress) external view returns (uint256 tokenId) {
        return propertyToTokenId[propertyAddress];
    }

    /**
     * @dev Get all token IDs owned by an address
     * @param owner The owner address
     * @return tokenIds Array of token IDs
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory tokenIds) {
        uint256 balance = balanceOf(owner);
        tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }

    /**
     * @dev Get cross-chain NFT info
     * @param tokenId The token ID
     * @return sourceChainSelector The source chain selector
     * @return sourceMessageId The source message ID
     */
    function getCrossChainInfo(uint256 tokenId) external view returns (uint64 sourceChainSelector, bytes32 sourceMessageId) {
        PropertyData memory property = tokenIdToProperty[tokenId];
        return (property.sourceChainSelector, property.sourceMessageId);
    }

    /**
     * @dev Check if a property exists
     * @param propertyAddress The property address
     * @return exists True if the property exists
     */
    function propertyExists(string memory propertyAddress) external view returns (bool exists) {
        return propertyToTokenId[propertyAddress] != 0;
    }

    /**
     * @dev Get current token counter
     * @return counter The current token counter
     */
    function getCurrentTokenCounter() external view returns (uint256 counter) {
        return _tokenIdCounter;
    }

    /**
     * @dev Emergency withdraw function (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = payable(owner()).call{value: balance}("");
            if (!success) {
                revert TransferFailed();
            }
        }
    }

    // Required overrides for multiple inheritance

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Function to receive native tokens
    receive() external payable {
        // Allow contract to receive native tokens
    }

    // Fallback function
    fallback() external payable {
        // Allow contract to receive native tokens
    }
} 