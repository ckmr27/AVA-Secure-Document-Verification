import crypto from 'crypto'

/**
 * Generate SHA-256 hash of a file or string
 */
export async function generateSHA256(input: string | Buffer): Promise<string> {
  return crypto.createHash('sha256').update(input).digest('hex')
}

/**
 * Calculate Levenshtein distance between two strings for fuzzy matching
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length

  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],      // deletion
          dp[i][j - 1],      // insertion
          dp[i - 1][j - 1]   // substitution
        )
      }
    }
  }

  return dp[m][n]
}

/**
 * Calculate similarity score between two strings (0 to 1)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2)
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  return (maxLength - distance) / maxLength
}

/**
 * Simulate OCR extraction from text
 * In production, this would integrate with Tesseract or Google Vision API
 */
export function simulateOCR(text: string): string {
  // Simulate minor OCR errors that might occur in real scans
  const errors = [
    { from: 'a', to: 'o' },
    { from: 'e', to: 'c' },
    { from: 's', to: '5' },
    { from: 'O', to: '0' },
    { from: 'l', to: '1' },
  ]

  let result = text
  for (let i = 0; i < result.length; i++) {
    // 5% chance of an OCR error
    if (Math.random() < 0.05) {
      const error = errors[Math.floor(Math.random() * errors.length)]
      if (result[i].toLowerCase() === error.from.toLowerCase()) {
        result = result.substring(0, i) + error.to + result.substring(i + 1)
      }
    }
  }
  return result
}

/**
 * Simulate CNN image forensics for tamper detection
 * Returns a tamper risk score (0 to 100)
 */
export function simulateImageForensics(): number {
  // In production, this would use a trained CNN model
  // For demo, return a low risk score
  return Math.floor(Math.random() * 15) // 0-15% risk score
}

/**
 * Simulate blockchain anchoring
 * Returns a mock transaction hash
 */
export function simulateBlockchainAnchoring(fileHash: string): string {
  // In production, this would interact with Ethereum or Hyperledger Fabric
  const blockNumber = Math.floor(Math.random() * 10000000)
  const txHash = '0x' + fileHash.substring(0, 40) + Math.random().toString(16).substring(2, 66)
  return txHash
}

/**
 * Simulate IPFS storage
 * Returns a mock IPFS hash
 */
export function simulateIPFSStorage(): string {
  // In production, this would interact with IPFS node
  const chars = 'Qm1YWNp78'
  let hash = ''
  for (let i = 0; i < 46; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash + 'a' + 'b' + 'c' + 'd' + 'e' + 'f'
}

/**
 * Perform comprehensive verification
 */
export interface VerificationResult {
  status: 'verified' | 'suspicious' | 'not_found'
  confidence: number
  details: {
    studentName: string
    institution: string
    degree: string
    year: number
    certCode: string
  }
  forensicScore: number
  blockchainVerified: boolean
  similarities: {
    studentName: number
    degree: number
  }
}

export async function verifyCertificate(
  certCode: string,
  extractedText: string,
  fileHash: string
): Promise<VerificationResult> {
  // For demo, we'll simulate the verification process
  // In production, this would query the database and perform real comparisons

  // Simulate database lookup
  const isFound = Math.random() > 0.2 // 80% chance of finding a match

  if (!isFound) {
    return {
      status: 'not_found',
      confidence: 0,
      details: {
        studentName: '',
        institution: '',
        degree: '',
        year: 0,
        certCode,
      },
      forensicScore: simulateImageForensics(),
      blockchainVerified: false,
      similarities: { studentName: 0, degree: 0 },
    }
  }

  // Simulate extracted data comparison
  const studentNameSimilarity = calculateSimilarity(
    extractedText.toLowerCase(),
    'john smith'
  )
  const degreeSimilarity = calculateSimilarity(
    extractedText.toLowerCase(),
    'bachelor of science'
  )

  const overallConfidence = (studentNameSimilarity + degreeSimilarity) / 2

  let status: VerificationResult['status']
  if (overallConfidence > 0.85) {
    status = 'verified'
  } else if (overallConfidence > 0.6) {
    status = 'suspicious'
  } else {
    status = 'not_found'
  }

  return {
    status,
    confidence: Math.round(overallConfidence * 100),
    details: {
      studentName: 'John Smith',
      institution: 'University of Technology',
      degree: 'Bachelor of Science in Computer Science',
      year: 2023,
      certCode,
    },
    forensicScore: simulateImageForensics(),
    blockchainVerified: status === 'verified',
    similarities: {
      studentName: Math.round(studentNameSimilarity * 100),
      degree: Math.round(degreeSimilarity * 100),
    },
  }
}
