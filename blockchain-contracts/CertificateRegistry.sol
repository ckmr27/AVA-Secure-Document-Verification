// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * Certificate Registry Smart Contract for AVA Platform
 * 
 * This contract manages academic certificate verification on Ethereum blockchain.
 * 
 * Key Features:
 * - Register new certificates
 * - Verify existing certificates
 * - Track certificate ownership
 * - Event logging for transparency
 */
contract CertificateRegistry is Ownable, ReentrancyGuard {
    
    // ============================================================
    // EVENTS
    // ============================================================
    
    /**
     * Emitted when a new certificate is registered
     */
    event CertificateRegistered(
        address indexed owner,
        string indexed certHash,
        string certCode,
        string metadata,
        uint256 timestamp
    );
    
    /**
     * Emitted when a certificate is verified
     */
    event CertificateVerified(
        string indexed certHash,
        bool verified,
        address indexed verifier,
        uint256 timestamp
    );
    
    /**
     * Emitted when certificate details are updated
     */
    event CertificateUpdated(
        string indexed certHash,
        address indexed updater,
        string newMetadata,
        uint256 timestamp
    );
    
    // ============================================================
    // STATE VARIABLES
    // ============================================================
    
    /**
     * Mapping of certificate hashes to registration status
     * certHash => bool
     */
    mapping(string => bool) public isRegistered;
    
    /**
     * Mapping of certificate hashes to verification status
     * certHash => bool
     */
    mapping(string => bool) public isVerified;
    
    /**
     * Mapping of certificate hashes to owner address
     * certHash => address
     */
    mapping(string => address) public certificateOwner;
    
    /**
     * Mapping of certificate hashes to registration timestamp
     * certHash => uint256
     */
    mapping(string => uint256) public registeredAt;
    
    /**
     * Mapping of certificate hashes to metadata (student name, degree, etc.)
     * certHash => string
     */
    mapping(string => string) public certMetadata;
    
    /**
     * Counter for total certificates
     */
    uint256 public totalCertificates;
    
    /**
     * Platform owner (for admin functions)
     */
    address public platformOwner;
    
    // ============================================================
    // MODIFIERS
    // ============================================================
    
    /**
     * Only platform owner can call admin functions
     */
    modifier onlyPlatformOwner() {
        require(msg.sender == platformOwner, "Only platform owner can call this");
        _;
    }
    
    // ============================================================
    // CONSTRUCTOR
    // ============================================================
    
    constructor() {
        platformOwner = msg.sender;
        totalCertificates = 0;
    }
    
    // ============================================================
    // PUBLIC FUNCTIONS
    // ============================================================
    
    /**
     * Register a new academic certificate
     * @param certHash - SHA-256 hash of the certificate file
     * @param certCode - Unique certificate code (e.g., CERT-2024-001)
     * @param metadata - JSON string with certificate details (student name, degree, etc.)
     */
    function registerCertificate(
        string memory certHash,
        string memory certCode,
        string memory metadata
    ) 
        public 
        nonReentrant 
    {
        // Validate inputs
        require(bytes(certHash).length == 32, "Certificate hash must be 32 bytes (SHA-256)");
        require(bytes(certCode).length > 0, "Certificate code cannot be empty");
        require(!isRegistered[certHash], "Certificate already registered");
        
        // Update state
        isRegistered[certHash] = true;
        certificateOwner[certHash] = msg.sender;
        registeredAt[certHash] = block.timestamp;
        certMetadata[certHash] = metadata;
        
        // Increment counter
        totalCertificates += 1;
        
        // Emit event
        emit CertificateRegistered(
            msg.sender,
            certHash,
            certCode,
            metadata,
            block.timestamp
        );
    }
    
    /**
     * Verify a certificate by hash
     * @param certHash - SHA-256 hash to verify
     * @return bool - True if certificate is registered
     */
    function verifyCertificate(string memory certHash) 
        public 
        view 
        returns (
            bool registered,
            bool verified,
            address owner,
            uint256 timestamp
        ) 
    {
        return (
            isRegistered[certHash],
            isVerified[certHash],
            certificateOwner[certHash],
            registeredAt[certHash]
        );
    }
    
    /**
     * Mark a certificate as verified
     * Can be called by verifiers or institutions
     * @param certHash - SHA-256 hash to mark as verified
     */
    function markAsVerified(string memory certHash) 
        public 
        nonReentrant 
    {
        require(isRegistered[certHash], "Certificate not registered");
        
        isVerified[certHash] = true;
        
        emit CertificateVerified(
            certHash,
            true,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * Get certificate metadata
     * @param certHash - SHA-256 hash to query
     * @return string - Metadata JSON string
     */
    function getCertificateMetadata(string memory certHash) 
        public 
        view 
        returns (string memory metadata) 
    {
        require(isRegistered[certHash], "Certificate not registered");
        return certMetadata[certHash];
    }
    
    /**
     * Get all certificates for a specific owner
     * @param owner - Address to query
     * @return certHashes[] - Array of certificate hashes
     */
    function getCertificatesByOwner(address owner) 
        public 
        view 
        returns (string[] memory certHashes) 
    {
        // In production, this would be paginated
        string[] memory result = new string[](totalCertificates);
        uint256 count = 0;
        
        // This is simplified - production version would be more efficient
        for (uint256 i = 0; i < totalCertificates; i++) {
            if (count >= totalCertificates) break;
            certHashes[count] = "INDEX_NOT_IMPLEMENTED"; // Would need separate mapping
            count++;
        }
        
        return result;
    }
    
    /**
     * Check if certificate code is available (for registration)
     * @param certCode - Certificate code to check
     * @return bool - True if code is available
     */
    function isCertCodeAvailable(string memory certCode) 
        public 
        view 
        returns (bool) 
    {
        // In production, this would check if code is already registered
        // For now, returns true (always available)
        return true;
    }
    
    // ============================================================
    // ADMIN FUNCTIONS
    // ============================================================
    
    /**
     * Update platform owner (for governance)
     * @param newOwner - New platform owner address
     */
    function transferPlatformOwnership(address newOwner) 
        public 
        onlyPlatformOwner 
    {
        platformOwner = newOwner;
    }
    
    /**
     * Update certificate metadata (admin function)
     * @param certHash - Certificate hash to update
     * @param newMetadata - New metadata
     */
    function updateCertificateMetadata(
        string memory certHash,
        string memory newMetadata
    ) 
        public 
        onlyPlatformOwner 
    {
        require(isRegistered[certHash], "Certificate not registered");
        
        certMetadata[certHash] = newMetadata;
        
        emit CertificateUpdated(
            certHash,
            msg.sender,
            newMetadata,
            block.timestamp
        );
    }
    
    /**
     * Emergency pause of registrations (if needed)
     */
    bool public registrationsPaused;
    
    function toggleRegistrations(bool paused) 
        public 
        onlyPlatformOwner 
    {
        registrationsPaused = paused;
    }
    
    /**
     * Batch register multiple certificates
     * @param certHashes - Array of certificate hashes
     * @param certCodes - Array of certificate codes
     * @param metadataArray - Array of metadata strings
     */
    function batchRegisterCertificates(
        string[] memory certHashes,
        string[] memory certCodes,
        string[] memory metadataArray
    ) 
        public 
        nonReentrant 
    {
        require(!registrationsPaused, "Registrations are paused");
        require(certHashes.length == certCodes.length, "Arrays must be same length");
        require(certHashes.length == metadataArray.length, "Arrays must be same length");
        
        for (uint256 i = 0; i < certHashes.length; i++) {
            registerCertificate(certHashes[i], certCodes[i], metadataArray[i]);
        }
    }
}