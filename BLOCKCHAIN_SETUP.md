# 🔗 Blockchain Integration Guide

## 📋 Overview

AVA now supports **THREE blockchain modes**:

1. **SIMULATION** (Default - Works out of the box)
2. **ETHEREUM** (Real Ethereum Mainnet/Testnet)
3. **FABRIC** (Hyperledger Fabric Enterprise Blockchain)

---

## 🎭 Mode 1: SIMULATION (Default)

**No setup required!** Works immediately for demo purposes.

### What Happens:
- Certificate codes are auto-generated
- Blockchain transaction hashes are simulated
- IPFS hashes are simulated
- Perfect for development and testing

### How It Works:
```
Upload File → System checks database
              ↓
        If new → Generate mock TX hash
              ↓
        If exists → Return existing TX hash
```

### Enable:
```env
BLOCKCHAIN_TYPE=SIMULATION
```

---

## ⚡ Mode 2: ETHEREUM (Real Ethereum)

### Step 1: Get Alchemy API Key

1. Go to: https://www.alchemy.com/
2. Sign up / Log in
3. Create new app
4. Copy API key

### Step 2: Deploy Smart Contract

#### Contract Code (`contracts/CertificateRegistry.sol`):
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    // Events
    event CertificateRegistered(
        address indexed owner,
        string certHash,
        uint256 timestamp
    );
    
    event CertificateVerified(
        string certHash,
        bool verified,
        uint256 timestamp
    );
    
    // Mappings
    mapping(string => bool) public isRegistered;
    mapping(string => bool) public isVerified;
    mapping(string => address) public certificateOwner;
    mapping(string => uint256) public registeredAt;
    
    // Register a new certificate
    function registerCertificate(string memory certHash) public {
        require(!isRegistered[certHash], "Certificate already registered");
        
        isRegistered[certHash] = true;
        certificateOwner[certHash] = msg.sender;
        registeredAt[certHash] = block.timestamp;
        
        emit CertificateRegistered(msg.sender, certHash, block.timestamp);
    }
    
    // Verify a certificate
    function verifyCertificate(string memory certHash) public view returns (bool) {
        return isRegistered[certHash];
    }
    
    // Get certificate info
    function getCertificate(string memory certHash) public view returns (
        bool registered,
        bool verified,
        address owner,
        uint256 timestamp
    ) {
        return (
            isRegistered[certHash],
            isVerified[certHash],
            certificateOwner[certHash],
            registeredAt[certHash]
        );
    }
}
```

#### Deploy Contract (Using Remix):

1. Go to: https://remix.ethereum.org/
2. Create new file: `CertificateRegistry.sol`
3. Paste the contract code above
4. Compile (Solidity Compiler tab)
5. Deploy (Deploy & Run Transactions tab)
6. Choose Environment:
   - **Testnet (Sepolia, Goerli)** - Free, uses test ETH
   - **Mainnet** - Real ETH, costs gas
7. Click "Deploy"
8. Copy the deployed contract address

### Step 3: Configure Environment

Update your `.env` file:
```env
BLOCKCHAIN_TYPE=ETHEREUM
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHEREUM_API_KEY=YOUR_ALCHEMY_API_KEY
ETHEREUM_CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
ETHEREUM_PRIVATE_KEY=YourTestnetPrivateKey  # For testnet only!
```

### Step 4: Install Dependencies

```bash
npm install ethers
```

### Step 5: Test Connection

```bash
# Test blockchain connection
node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY');
provider.getBlockNumber().then(bn => console.log('Connected! Block:', bn));
"
```

---

## 🏛️ Mode 3: HYPERLEDGER FABRIC (Enterprise Blockchain)

### Prerequisites

- Docker and Docker Compose
- Node.js 14+ or Bun
- Go 1.19+

### Step 1: Set Up Fabric Network

#### Option A: Use Test Network (Easiest)

1. Clone Fabric Samples:
```bash
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples/test-network
```

2. Start Test Network:
```bash
./network.sh up createChannel
```

3. This will create:
- CA server
- Ordering service
- 2 Peer nodes
- Channel: mychannel
- Connection profile: `connection-org1.json`

#### Option B: Managed Fabric Service

Use services like:
- IBM Blockchain Platform
- Azure Blockchain Service
- AWS Managed Blockchain

### Step 2: Deploy Chaincode

1. Navigate to chaincode:
```bash
cd fabric-samples/test-network/chaincode
```

2. Install chaincode:
```bash
./network.sh deployCC
```

### Step 3: Create Identities

```bash
# From fabric-samples/test-network/fabcar directory
./enrollAdmin.sh
./registerUser.sh
```

This creates:
- MSP (Membership Service Provider)
- Certificates in `wallet/` folder
- User identities: admin, user1

### Step 4: Configure Environment

Update your `.env` file:
```env
BLOCKCHAIN_TYPE=FABRIC
FABRIC_CCP_PATH=./connection-org1.json
FABRIC_WALLET_PATH=./wallet
FABRIC_IDENTITY=admin
FABRIC_CHANNEL=mychannel
FABRIC_CHAINCODE=basic
FABRIC_CONTRACT=basic
```

### Step 5: Install Fabric SDK

```bash
npm install fabric-network fabric-ca-client
```

### Step 6: Test Connection

```bash
# Test connection to Fabric
node -e "
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const ccpPath = path.resolve('./connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

console.log('Connection Profile:', ccp.channel);
```

---

## 🔀 Switching Between Modes

### From Simulation to Ethereum:
```env
# In .env file:
BLOCKCHAIN_TYPE=ETHEREUM
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHEREUM_API_KEY=YOUR_KEY
ETHEREUM_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
```

### From Simulation to Fabric:
```env
# In .env file:
BLOCKCHAIN_TYPE=FABRIC
FABRIC_CCP_PATH=./connection-org1.json
# ... other Fabric config
```

### From Real to Simulation:
```env
# In .env file:
BLOCKCHAIN_TYPE=SIMULATION
```

---

## 📊 Comparison Table

| Feature | Simulation | Ethereum | Fabric |
|---------|------------|----------|---------|
| **Setup Time** | 0 minutes | 30 minutes | 2+ hours |
| **Cost** | Free | Gas fees (ETH) | Infrastructure cost |
| **Use Case** | Demo/Dev | Public blockchain | Enterprise/Consortium |
| **Privacy** | N/A | Public ledger | Private permissioned |
| **Performance** | Instant | Medium (12-30s) | Fast (1-3s) |
| **Scalability** | N/A | High | High |
| **Governance** | N/A | Decentralized | Consortium |

---

## 🚀 Deployment Checklist

### For Ethereum:
- [ ] Alchemy account created
- [ ] Smart contract deployed (testnet or mainnet)
- [ ] Contract address copied to .env
- [ ] API key added to .env
- [ ] Private key configured (testnet only!)
- [ ] npm install ethers
- [ ] Test transaction submitted
- [ ] BLOCKCHAIN_TYPE=ETHEREUM in .env

### For Fabric:
- [ ] Fabric test network running
- [ ] Chaincode deployed
- [ ] Identities created (enrollAdmin.sh)
- [ ] Connection profile (connection-org1.json) copied
- [ ] npm install fabric-network
- [ ] Test connection successful
- [ ] BLOCKCHAIN_TYPE=FABRIC in .env

### For Simulation:
- [ ] BLOCKCHAIN_TYPE=SIMULATION in .env (default)
- [ ] No additional setup needed
- [ ] Ready to use!

---

## 🛡️ Best Practices

### Security:
1. **NEVER commit private keys** to git
2. Use **environment variables** for secrets
3. Use **different keys** for dev/staging/production
4. **Rotate keys** regularly
5. Use **testnet first** before mainnet

### Development:
1. Start with **SIMULATION mode** to test logic
2. Use **testnet** for Ethereum development
3. Use **local Fabric network** for development
4. Test thoroughly before production

### Production:
1. Use **mainnet** for Ethereum
2. Use **managed Fabric services** or dedicated infrastructure
3. Monitor **gas costs** and transaction fees
4. Set up **alerts** for failed transactions
5. Use **IPFS** or similar for document storage

---

## 🐛 Troubleshooting

### Ethereum Issues:
```
Error: "insufficient funds"
Solution: Use testnet (Sepolia, Goerli) with free test ETH

Error: "contract not deployed"
Solution: Deploy contract first using Remix

Error: "network error"
Solution: Check API key and RPC URL
```

### Fabric Issues:
```
Error: "connection profile not found"
Solution: Copy connection-org1.json from Fabric test-network

Error: "identity not found"
Solution: Run enrollAdmin.sh to create identity

Error: "channel not found"
Solution: Ensure Fabric network is running: ./network.sh up createChannel
```

---

## 📞 Support Resources

### Ethereum:
- Alchemy: https://www.alchemy.com/
- Remix IDE: https://remix.ethereum.org/
- Ethereum Docs: https://docs.ethers.org/
- OpenZeppelin: https://docs.openzeppelin.com/

### Hyperledger Fabric:
- Official Docs: https://hyperledger-fabric.readthedocs.io/
- Fabric Samples: https://github.com/hyperledger/fabric-samples
- Fabric Academy: https://hyperledger-fabric.academy.softbay.com/

### Web3 Libraries:
- ethers.js: https://docs.ethers.org/
- web3.js: https://web3js.readthedocs.io/
- wagmi: https://wagmi.sh/

---

## 🎉 Quick Start

### Simulation Mode (Default):
```bash
# Already configured! Just run:
npm run dev
```

### Ethereum Mode:
```bash
# 1. Set .env variables
cp .env.example .env
nano .env  # Add your Alchemy keys

# 2. Install dependencies
npm install ethers

# 3. Start
npm run dev
```

### Fabric Mode:
```bash
# 1. Start Fabric network
cd /path/to/fabric-samples/test-network
./network.sh up createChannel

# 2. Set .env variables
cp .env.example .env
nano .env  # Update Fabric paths

# 3. Install dependencies
npm install fabric-network fabric-ca-client

# 4. Start AVA
cd /path/to/ava-project
npm run dev
```

---

**Last Updated:** 2025
**Status:** ✅ All blockchain modes supported!
