/**
 * Blockchain Configuration
 * Supports: Ethereum, Hyperledger Fabric, and Simulation
 */

export type BlockchainType = 'ETHEREUM' | 'FABRIC' | 'SIMULATION'

export interface BlockchainConfig {
  type: BlockchainType
  ethereum?: {
    apiKey?: string
    rpcUrl?: string
    contractAddress?: string
    privateKey?: string
  }
  fabric?: {
    ccpPath?: string
    walletPath?: string
    identity?: string
    channelName?: string
    chaincodeName?: string
    contractName?: string
  }
}

export const BLOCKCHAIN_CONFIG: BlockchainConfig = {
  // From environment variables or use defaults
  type: (process.env.BLOCKCHAIN_TYPE as BlockchainType) || 'SIMULATION',
  
  ethereum: {
    // Get from environment or use default Alchemy RPC
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    apiKey: process.env.ETHEREUM_API_KEY,
    contractAddress: process.env.ETHEREUM_CONTRACT_ADDRESS,
    // ⚠️ NEVER commit real private keys!
    privateKey: process.env.ETHEREUM_PRIVATE_KEY,
  },
  
  fabric: {
    ccpPath: process.env.FABRIC_CCP_PATH,
    walletPath: process.env.FABRIC_WALLET_PATH,
    identity: process.env.FABRIC_IDENTITY || 'admin',
    channelName: process.env.FABRIC_CHANNEL || 'mychannel',
    chaincodeName: process.env.FABRIC_CHAINCODE || 'basic',
    contractName: process.env.FABRIC_CONTRACT || 'basic',
  },
}

export function isSimulationMode(): boolean {
  return BLOCKCHAIN_CONFIG.type === 'SIMULATION'
}

export function isEthereumMode(): boolean {
  return BLOCKCHAIN_CONFIG.type === 'ETHEREUM'
}

export function isFabricMode(): boolean {
  return BLOCKCHAIN_CONFIG.type === 'FABRIC'
}
