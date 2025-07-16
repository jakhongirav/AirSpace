// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT FOR THE CHAINLINK CCIP HACKATHON.
 * THIS CONTRACT USES HARDCODED VALUES FOR CLARITY.
 * DO NOT USE THIS CODE IN PRODUCTION WITHOUT PROPER AUDITING.
 */

/// @title AirSpaceCCIPSender - Cross-chain NFT data sender using Chainlink CCIP
/// @notice This contract sends NFT metadata and ownership data across chains
contract AirSpaceCCIPSender is OwnerIsCreator {
    
    // Custom errors
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);
    error InvalidDestinationChain(uint64 destinationChainSelector);
    error InvalidNFTOwner(address caller, address owner);
    error InvalidNFTContract(address nftContract);

    // Events
    event NFTDataSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address indexed receiver,
        address nftContract,
        uint256 tokenId,
        address originalOwner,
        string propertyAddress,
        address feeToken,
        uint256 fees
    );

    event CrossChainPaymentReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address indexed sender,
        address paymentToken,
        uint256 amount,
        uint256 nftTokenId
    );

    // Struct to hold NFT data
    struct NFTData {
        address nftContract;
        uint256 tokenId;
        address originalOwner;
        string propertyAddress;
        uint256 currentHeight;
        uint256 maximumHeight;
        uint256 availableFloors;
        uint256 price;
        string metadataURI;
    }

    // Chainlink CCIP Router
    IRouterClient private s_router;
    
    // LINK token interface
    LinkTokenInterface private s_linkToken;
    
    // Supported destination chains
    mapping(uint64 => bool) public supportedDestinationChains;
    
    // Supported NFT contracts
    mapping(address => bool) public supportedNFTContracts;
    
    // Cross-chain payment tracking
    mapping(bytes32 => NFTData) public pendingNFTTransfers;
    
    // Payment tracking
    mapping(uint256 => uint256) public nftPrices; // tokenId => price in Wei
    
    /// @notice Constructor initializes the contract with router and LINK addresses
    /// @param _router The address of the Chainlink CCIP router
    /// @param _link The address of the LINK token
    constructor(address _router, address _link) {
        s_router = IRouterClient(_router);
        s_linkToken = LinkTokenInterface(_link);
        
        // Initialize supported chains (Ethereum Sepolia to Avalanche Fuji example)
        supportedDestinationChains[16015286601757825753] = true; // Ethereum Sepolia
        supportedDestinationChains[14767482510784806043] = true; // Avalanche Fuji
        // Add more chain selectors as needed for Polkadot when supported
    }

    /// @notice Add a supported destination chain
    /// @param destinationChainSelector The chain selector to support
    function addSupportedChain(uint64 destinationChainSelector) external onlyOwner {
        supportedDestinationChains[destinationChainSelector] = true;
    }

    /// @notice Remove a supported destination chain
    /// @param destinationChainSelector The chain selector to remove
    function removeSupportedChain(uint64 destinationChainSelector) external onlyOwner {
        supportedDestinationChains[destinationChainSelector] = false;
    }

    /// @notice Add a supported NFT contract
    /// @param nftContract The NFT contract address to support
    function addSupportedNFTContract(address nftContract) external onlyOwner {
        supportedNFTContracts[nftContract] = true;
    }

    /// @notice Remove a supported NFT contract
    /// @param nftContract The NFT contract address to remove
    function removeSupportedNFTContract(address nftContract) external onlyOwner {
        supportedNFTContracts[nftContract] = false;
    }

    /// @notice Set the price for an NFT
    /// @param tokenId The token ID
    /// @param priceInWei The price in wei
    function setNFTPrice(uint256 tokenId, uint256 priceInWei) external onlyOwner {
        nftPrices[tokenId] = priceInWei;
    }

    /// @notice Send NFT data to another chain using CCIP
    /// @param destinationChainSelector The destination chain selector
    /// @param receiver The receiver contract address on destination chain
    /// @param nftData The NFT data to send
    /// @return messageId The CCIP message ID
    function sendNFTData(
        uint64 destinationChainSelector,
        address receiver,
        NFTData memory nftData
    ) external returns (bytes32 messageId) {
        
        // Validate destination chain
        if (!supportedDestinationChains[destinationChainSelector]) {
            revert InvalidDestinationChain(destinationChainSelector);
        }
        
        // Validate NFT contract
        if (!supportedNFTContracts[nftData.nftContract]) {
            revert InvalidNFTContract(nftData.nftContract);
        }
        
        // Verify NFT ownership
        IERC721 nft = IERC721(nftData.nftContract);
        address nftOwner = nft.ownerOf(nftData.tokenId);
        if (nftOwner != msg.sender && nftOwner != nftData.originalOwner) {
            revert InvalidNFTOwner(msg.sender, nftOwner);
        }

        // Encode the NFT data
        bytes memory encodedData = abi.encode(
            nftData.nftContract,
            nftData.tokenId,
            nftData.originalOwner,
            nftData.propertyAddress,
            nftData.currentHeight,
            nftData.maximumHeight,
            nftData.availableFloors,
            nftData.price,
            nftData.metadataURI,
            msg.sender // current caller
        );

        // Create CCIP message
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: encodedData,
            tokenAmounts: new Client.EVMTokenAmount[](0), // No tokens being sent with message
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({
                    gasLimit: 500_000, // Higher gas limit for complex operations
                    allowOutOfOrderExecution: true
                })
            ),
            feeToken: address(s_linkToken)
        });

        // Calculate fees
        uint256 fees = s_router.getFee(destinationChainSelector, evm2AnyMessage);

        // Check LINK balance
        if (fees > s_linkToken.balanceOf(address(this))) {
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);
        }

        // Approve router to spend LINK
        s_linkToken.approve(address(s_router), fees);

        // Send the message
        messageId = s_router.ccipSend(destinationChainSelector, evm2AnyMessage);

        // Store pending transfer
        pendingNFTTransfers[messageId] = nftData;

        // Emit event
        emit NFTDataSent(
            messageId,
            destinationChainSelector,
            receiver,
            nftData.nftContract,
            nftData.tokenId,
            nftData.originalOwner,
            nftData.propertyAddress,
            address(s_linkToken),
            fees
        );

        return messageId;
    }

    /// @notice Send NFT data with payment option
    /// @param destinationChainSelector The destination chain selector
    /// @param receiver The receiver contract address on destination chain
    /// @param nftData The NFT data to send
    /// @param paymentToken The token to send as payment (address(0) for native token)
    /// @param paymentAmount The amount to send as payment
    /// @return messageId The CCIP message ID
    function sendNFTDataWithPayment(
        uint64 destinationChainSelector,
        address receiver,
        NFTData memory nftData,
        address paymentToken,
        uint256 paymentAmount
    ) external payable returns (bytes32 messageId) {
        
        // Validate destination chain
        if (!supportedDestinationChains[destinationChainSelector]) {
            revert InvalidDestinationChain(destinationChainSelector);
        }

        // Prepare token amounts array
        Client.EVMTokenAmount[] memory tokenAmounts;
        
        if (paymentToken == address(0)) {
            // Native token payment
            require(msg.value >= paymentAmount, "Insufficient native token sent");
            // For native token, we would typically use WETH or similar wrapped token
            tokenAmounts = new Client.EVMTokenAmount[](0);
        } else {
            // ERC20 token payment
            tokenAmounts = new Client.EVMTokenAmount[](1);
            tokenAmounts[0] = Client.EVMTokenAmount({
                token: paymentToken,
                amount: paymentAmount
            });
            
            // Transfer tokens from sender to this contract
            IERC20(paymentToken).transferFrom(msg.sender, address(this), paymentAmount);
            
            // Approve router to spend tokens
            IERC20(paymentToken).approve(address(s_router), paymentAmount);
        }

        // Encode the NFT data with payment info
        bytes memory encodedData = abi.encode(
            nftData.nftContract,
            nftData.tokenId,
            nftData.originalOwner,
            nftData.propertyAddress,
            nftData.currentHeight,
            nftData.maximumHeight,
            nftData.availableFloors,
            nftData.price,
            nftData.metadataURI,
            msg.sender, // current caller
            paymentToken,
            paymentAmount
        );

        // Create CCIP message with payment
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: encodedData,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({
                    gasLimit: 600_000, // Higher gas limit for payment processing
                    allowOutOfOrderExecution: true
                })
            ),
            feeToken: address(s_linkToken)
        });

        // Calculate fees
        uint256 fees = s_router.getFee(destinationChainSelector, evm2AnyMessage);

        // Check LINK balance for fees
        if (fees > s_linkToken.balanceOf(address(this))) {
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);
        }

        // Approve router to spend LINK for fees
        s_linkToken.approve(address(s_router), fees);

        // Send the message
        messageId = s_router.ccipSend(destinationChainSelector, evm2AnyMessage);

        // Store pending transfer
        pendingNFTTransfers[messageId] = nftData;

        // Emit event
        emit NFTDataSent(
            messageId,
            destinationChainSelector,
            receiver,
            nftData.nftContract,
            nftData.tokenId,
            nftData.originalOwner,
            nftData.propertyAddress,
            address(s_linkToken),
            fees
        );

        return messageId;
    }

    /// @notice Withdraw LINK tokens from the contract
    /// @param to The address to send LINK to
    /// @param amount The amount of LINK to withdraw
    function withdrawLink(address to, uint256 amount) external onlyOwner {
        s_linkToken.transfer(to, amount);
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

    /// @notice Get the fee for sending a message
    /// @param destinationChainSelector The destination chain selector
    /// @param nftData The NFT data to send
    /// @return fee The fee in LINK tokens
    function getFee(
        uint64 destinationChainSelector,
        NFTData memory nftData
    ) external view returns (uint256 fee) {
        
        bytes memory encodedData = abi.encode(
            nftData.nftContract,
            nftData.tokenId,
            nftData.originalOwner,
            nftData.propertyAddress,
            nftData.currentHeight,
            nftData.maximumHeight,
            nftData.availableFloors,
            nftData.price,
            nftData.metadataURI,
            msg.sender
        );

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(address(0)), // Placeholder for fee calculation
            data: encodedData,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({
                    gasLimit: 500_000,
                    allowOutOfOrderExecution: true
                })
            ),
            feeToken: address(s_linkToken)
        });

        return s_router.getFee(destinationChainSelector, evm2AnyMessage);
    }

    /// @notice Check if a destination chain is supported
    /// @param destinationChainSelector The chain selector to check
    /// @return supported True if the chain is supported
    function isChainSupported(uint64 destinationChainSelector) external view returns (bool supported) {
        return supportedDestinationChains[destinationChainSelector];
    }

    /// @notice Check if an NFT contract is supported
    /// @param nftContract The NFT contract address to check
    /// @return supported True if the contract is supported
    function isNFTContractSupported(address nftContract) external view returns (bool supported) {
        return supportedNFTContracts[nftContract];
    }

    /// @notice Get pending NFT transfer data
    /// @param messageId The CCIP message ID
    /// @return nftData The NFT data for the pending transfer
    function getPendingTransfer(bytes32 messageId) external view returns (NFTData memory nftData) {
        return pendingNFTTransfers[messageId];
    }

    // Function to receive native tokens
    receive() external payable {}
    
    // Fallback function
    fallback() external payable {}
} 