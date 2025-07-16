// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT FOR THE CHAINLINK CCIP HACKATHON.
 * THIS CONTRACT USES HARDCODED VALUES FOR CLARITY.
 * DO NOT USE THIS CODE IN PRODUCTION WITHOUT PROPER AUDITING.
 */

/// @title AirSpaceCCIPReceiver - Cross-chain NFT receiver using Chainlink CCIP
/// @notice This contract receives NFT data from other chains and mints corresponding NFTs
contract AirSpaceCCIPReceiver is CCIPReceiver, ERC721URIStorage, Ownable {
    
    // Custom errors
    error InvalidSourceChain(uint64 sourceChainSelector);
    error InvalidSender(address sender);
    error PaymentProcessingFailed(address token, uint256 amount);
    error NFTMintingFailed(address to, uint256 tokenId);

    // Events
    event NFTDataReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address indexed sender,
        address nftContract,
        uint256 sourceTokenId,
        uint256 newTokenId,
        address originalOwner,
        string propertyAddress
    );

    event CrossChainPaymentProcessed(
        bytes32 indexed messageId,
        address indexed buyer,
        address paymentToken,
        uint256 amount,
        uint256 nftTokenId
    );

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string propertyAddress,
        bytes32 indexed sourceMessageId
    );

    // Struct to hold received NFT data
    struct ReceivedNFTData {
        address sourceNftContract;
        uint256 sourceTokenId;
        address originalOwner;
        string propertyAddress;
        uint256 currentHeight;
        uint256 maximumHeight;
        uint256 availableFloors;
        uint256 price;
        string metadataURI;
        address caller;
        address paymentToken;
        uint256 paymentAmount;
        uint64 sourceChainSelector;
        bool processed;
    }

    // Token counter for minting new NFTs
    uint256 private _tokenIdCounter;
    
    // Supported source chains
    mapping(uint64 => bool) public supportedSourceChains;
    
    // Supported sender contracts
    mapping(address => bool) public supportedSenders;
    
    // Message ID to received NFT data mapping
    mapping(bytes32 => ReceivedNFTData) public receivedNFTData;
    
    // Source chain and token ID to local token ID mapping
    mapping(uint64 => mapping(uint256 => uint256)) public sourceToLocalTokenId;
    
    // Local token ID to source data mapping
    mapping(uint256 => bytes32) public localTokenIdToMessageId;
    
    // Payment recipient address
    address public paymentRecipient;

    /// @notice Constructor initializes the contract
    /// @param router The address of the Chainlink CCIP router
    /// @param _paymentRecipient The address to receive payments
    constructor(
        address router,
        address _paymentRecipient
    ) CCIPReceiver(router) ERC721("AirSpace Cross-Chain NFT", "ASCCNFT") Ownable(msg.sender) {
        paymentRecipient = _paymentRecipient;
        _tokenIdCounter = 1;
        
        // Initialize supported chains (example: Avalanche Fuji to Ethereum Sepolia)
        supportedSourceChains[14767482510784806043] = true; // Avalanche Fuji
        supportedSourceChains[16015286601757825753] = true; // Ethereum Sepolia
    }

    /// @notice Add a supported source chain
    /// @param sourceChainSelector The chain selector to support
    function addSupportedSourceChain(uint64 sourceChainSelector) external onlyOwner {
        supportedSourceChains[sourceChainSelector] = true;
    }

    /// @notice Remove a supported source chain
    /// @param sourceChainSelector The chain selector to remove
    function removeSupportedSourceChain(uint64 sourceChainSelector) external onlyOwner {
        supportedSourceChains[sourceChainSelector] = false;
    }

    /// @notice Add a supported sender contract
    /// @param sender The sender contract address to support
    function addSupportedSender(address sender) external onlyOwner {
        supportedSenders[sender] = true;
    }

    /// @notice Remove a supported sender contract
    /// @param sender The sender contract address to remove
    function removeSupportedSender(address sender) external onlyOwner {
        supportedSenders[sender] = false;
    }

    /// @notice Set the payment recipient address
    /// @param _paymentRecipient The new payment recipient address
    function setPaymentRecipient(address _paymentRecipient) external onlyOwner {
        paymentRecipient = _paymentRecipient;
    }

    /// @notice Handle received CCIP messages
    /// @param any2EvmMessage The CCIP message
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        
        // Validate source chain
        if (!supportedSourceChains[any2EvmMessage.sourceChainSelector]) {
            revert InvalidSourceChain(any2EvmMessage.sourceChainSelector);
        }

        // Decode sender address
        address sender = abi.decode(any2EvmMessage.sender, (address));
        
        // Validate sender (optional - can be removed for open system)
        // if (!supportedSenders[sender]) {
        //     revert InvalidSender(sender);
        // }

        // Decode the message data
        bytes memory data = any2EvmMessage.data;
        
        // Try to decode with payment information first
        try this.decodeNFTDataWithPayment(data) returns (
            address sourceNftContract,
            uint256 sourceTokenId,
            address originalOwner,
            string memory propertyAddress,
            uint256 currentHeight,
            uint256 maximumHeight,
            uint256 availableFloors,
            uint256 price,
            string memory metadataURI,
            address caller,
            address paymentToken,
            uint256 paymentAmount
        ) {
            // Data includes payment information
            _processNFTDataWithPayment(
                any2EvmMessage,
                sourceNftContract,
                sourceTokenId,
                originalOwner,
                propertyAddress,
                currentHeight,
                maximumHeight,
                availableFloors,
                price,
                metadataURI,
                caller,
                paymentToken,
                paymentAmount
            );
        } catch {
            // Try to decode without payment information
            try this.decodeNFTDataOnly(data) returns (
                address sourceNftContract,
                uint256 sourceTokenId,
                address originalOwner,
                string memory propertyAddress,
                uint256 currentHeight,
                uint256 maximumHeight,
                uint256 availableFloors,
                uint256 price,
                string memory metadataURI,
                address caller
            ) {
                // Data without payment information
                _processNFTDataOnly(
                    any2EvmMessage,
                    sourceNftContract,
                    sourceTokenId,
                    originalOwner,
                    propertyAddress,
                    currentHeight,
                    maximumHeight,
                    availableFloors,
                    price,
                    metadataURI,
                    caller
                );
            } catch {
                // Failed to decode - emit an event for debugging
                // In production, you might want to handle this differently
                revert("Failed to decode NFT data");
            }
        }

        // Process any token transfers that came with the message
        if (any2EvmMessage.tokenAmounts.length > 0) {
            _processTokenTransfers(any2EvmMessage.messageId, any2EvmMessage.tokenAmounts);
        }
    }

    /// @notice External function to decode NFT data with payment (used in try-catch)
    /// @param data The encoded data
    function decodeNFTDataWithPayment(bytes memory data) external pure returns (
        address sourceNftContract,
        uint256 sourceTokenId,
        address originalOwner,
        string memory propertyAddress,
        uint256 currentHeight,
        uint256 maximumHeight,
        uint256 availableFloors,
        uint256 price,
        string memory metadataURI,
        address caller,
        address paymentToken,
        uint256 paymentAmount
    ) {
        return abi.decode(data, (
            address, uint256, address, string, uint256, uint256, uint256, uint256, string, address, address, uint256
        ));
    }

    /// @notice External function to decode NFT data only (used in try-catch)
    /// @param data The encoded data
    function decodeNFTDataOnly(bytes memory data) external pure returns (
        address sourceNftContract,
        uint256 sourceTokenId,
        address originalOwner,
        string memory propertyAddress,
        uint256 currentHeight,
        uint256 maximumHeight,
        uint256 availableFloors,
        uint256 price,
        string memory metadataURI,
        address caller
    ) {
        return abi.decode(data, (
            address, uint256, address, string, uint256, uint256, uint256, uint256, string, address
        ));
    }

    /// @notice Process NFT data with payment information
    function _processNFTDataWithPayment(
        Client.Any2EVMMessage memory any2EvmMessage,
        address sourceNftContract,
        uint256 sourceTokenId,
        address originalOwner,
        string memory propertyAddress,
        uint256 currentHeight,
        uint256 maximumHeight,
        uint256 availableFloors,
        uint256 price,
        string memory metadataURI,
        address caller,
        address paymentToken,
        uint256 paymentAmount
    ) internal {
        
        // Store received NFT data
        receivedNFTData[any2EvmMessage.messageId] = ReceivedNFTData({
            sourceNftContract: sourceNftContract,
            sourceTokenId: sourceTokenId,
            originalOwner: originalOwner,
            propertyAddress: propertyAddress,
            currentHeight: currentHeight,
            maximumHeight: maximumHeight,
            availableFloors: availableFloors,
            price: price,
            metadataURI: metadataURI,
            caller: caller,
            paymentToken: paymentToken,
            paymentAmount: paymentAmount,
            sourceChainSelector: any2EvmMessage.sourceChainSelector,
            processed: false
        });

        // Mint NFT to the caller (buyer)
        uint256 newTokenId = _mintNFT(caller, metadataURI, any2EvmMessage.messageId);
        
        // Map source token to local token
        sourceToLocalTokenId[any2EvmMessage.sourceChainSelector][sourceTokenId] = newTokenId;
        localTokenIdToMessageId[newTokenId] = any2EvmMessage.messageId;

        // Emit events
        emit NFTDataReceived(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector,
            abi.decode(any2EvmMessage.sender, (address)),
            sourceNftContract,
            sourceTokenId,
            newTokenId,
            originalOwner,
            propertyAddress
        );

        emit CrossChainPaymentProcessed(
            any2EvmMessage.messageId,
            caller,
            paymentToken,
            paymentAmount,
            newTokenId
        );

        // Mark as processed
        receivedNFTData[any2EvmMessage.messageId].processed = true;
    }

    /// @notice Process NFT data without payment information
    function _processNFTDataOnly(
        Client.Any2EVMMessage memory any2EvmMessage,
        address sourceNftContract,
        uint256 sourceTokenId,
        address originalOwner,
        string memory propertyAddress,
        uint256 currentHeight,
        uint256 maximumHeight,
        uint256 availableFloors,
        uint256 price,
        string memory metadataURI,
        address caller
    ) internal {
        
        // Store received NFT data
        receivedNFTData[any2EvmMessage.messageId] = ReceivedNFTData({
            sourceNftContract: sourceNftContract,
            sourceTokenId: sourceTokenId,
            originalOwner: originalOwner,
            propertyAddress: propertyAddress,
            currentHeight: currentHeight,
            maximumHeight: maximumHeight,
            availableFloors: availableFloors,
            price: price,
            metadataURI: metadataURI,
            caller: caller,
            paymentToken: address(0),
            paymentAmount: 0,
            sourceChainSelector: any2EvmMessage.sourceChainSelector,
            processed: false
        });

        // Mint NFT to the original owner (transfer scenario)
        uint256 newTokenId = _mintNFT(originalOwner, metadataURI, any2EvmMessage.messageId);
        
        // Map source token to local token
        sourceToLocalTokenId[any2EvmMessage.sourceChainSelector][sourceTokenId] = newTokenId;
        localTokenIdToMessageId[newTokenId] = any2EvmMessage.messageId;

        // Emit event
        emit NFTDataReceived(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector,
            abi.decode(any2EvmMessage.sender, (address)),
            sourceNftContract,
            sourceTokenId,
            newTokenId,
            originalOwner,
            propertyAddress
        );

        // Mark as processed
        receivedNFTData[any2EvmMessage.messageId].processed = true;
    }

    /// @notice Process token transfers from CCIP
    /// @param messageId The CCIP message ID
    /// @param tokenAmounts The token amounts received
    function _processTokenTransfers(
        bytes32 messageId,
        Client.EVMTokenAmount[] memory tokenAmounts
    ) internal {
        for (uint256 i = 0; i < tokenAmounts.length; i++) {
            address token = tokenAmounts[i].token;
            uint256 amount = tokenAmounts[i].amount;
            
            if (paymentRecipient != address(0)) {
                // Transfer to payment recipient
                IERC20(token).transfer(paymentRecipient, amount);
            }
            // If no payment recipient set, tokens stay in this contract
        }
    }

    /// @notice Mint a new NFT
    /// @param to The address to mint to
    /// @param metadataURI The metadata URI
    /// @param messageId The source message ID
    /// @return tokenId The new token ID
    function _mintNFT(address to, string memory metadataURI, bytes32 messageId) internal returns (uint256 tokenId) {
        tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        
        if (bytes(metadataURI).length > 0) {
            _setTokenURI(tokenId, metadataURI);
        }

        emit NFTMinted(tokenId, to, receivedNFTData[messageId].propertyAddress, messageId);
        
        return tokenId;
    }

    /// @notice Get received NFT data by message ID
    /// @param messageId The CCIP message ID
    /// @return nftData The received NFT data
    function getReceivedNFTData(bytes32 messageId) external view returns (ReceivedNFTData memory nftData) {
        return receivedNFTData[messageId];
    }

    /// @notice Get local token ID from source chain and token ID
    /// @param sourceChainSelector The source chain selector
    /// @param sourceTokenId The source token ID
    /// @return localTokenId The local token ID
    function getLocalTokenId(uint64 sourceChainSelector, uint256 sourceTokenId) external view returns (uint256 localTokenId) {
        return sourceToLocalTokenId[sourceChainSelector][sourceTokenId];
    }

    /// @notice Get source message ID from local token ID
    /// @param localTokenId The local token ID
    /// @return messageId The source message ID
    function getSourceMessageId(uint256 localTokenId) external view returns (bytes32 messageId) {
        return localTokenIdToMessageId[localTokenId];
    }

    /// @notice Check if a source chain is supported
    /// @param sourceChainSelector The chain selector to check
    /// @return supported True if the chain is supported
    function isSourceChainSupported(uint64 sourceChainSelector) external view returns (bool supported) {
        return supportedSourceChains[sourceChainSelector];
    }

    /// @notice Check if a sender is supported
    /// @param sender The sender address to check
    /// @return supported True if the sender is supported
    function isSenderSupported(address sender) external view returns (bool supported) {
        return supportedSenders[sender];
    }

    /// @notice Get the current token counter
    /// @return counter The current token counter
    function getCurrentTokenCounter() external view returns (uint256 counter) {
        return _tokenIdCounter;
    }

    /// @notice Withdraw ERC20 tokens from the contract
    /// @param token The token contract address
    /// @param to The address to send tokens to
    /// @param amount The amount to withdraw
    function withdrawToken(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }

    /// @notice Withdraw native tokens from the contract
    /// @param to The address to send native tokens to
    /// @param amount The amount to withdraw
    function withdrawNative(address payable to, uint256 amount) external onlyOwner {
        to.transfer(amount);
    }

    // Function to receive native tokens
    receive() external payable {}
    
    // Fallback function
    fallback() external payable {}
} 