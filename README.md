# AVA - Authenticity Validator for Academia

**Enterprise-grade document verification platform with integrated blockchain support for tamper-proof certificate authentication.**

---

## Overview

AVA is a secure, scalable web application designed to verify the authenticity of academic certificates and credentials through multi-layered validation techniques, including SHA-256 cryptographic hashing and optional blockchain registration for immutable proof of authenticity.

### Real-World Problem

Educational credential fraud represents a significant challenge in academic institutions, corporate hiring, and professional verification systems. Traditional verification methods are manual, time-consuming, and lack cryptographic proof of authenticity. Organizations need a fast, verifiable, and trustworthy way to authenticate academic documents.

**AVA solves this by:**
- Providing instant document verification against registered certificates
- Creating cryptographic fingerprints (SHA-256) of documents
- Optionally registering certificates on blockchain for immutable proof
- Offering enterprise-grade security with role-based access control
- Supporting multiple blockchain backends (Ethereum or local simulation)

---

## Key Features

### Core Verification
- ✅ **SHA-256 Hash Verification** - Cryptographic fingerprinting of documents
- ✅ **Fuzzy Matching** - Detect similar certificates with confidence scoring
- ✅ **Real-time Status** - Instant verification results (Verified / Suspicious / Not Found)
- ✅ **Auto Code Generation** - Unique certificate codes generated automatically
- ✅ **Confidence Scoring** - 0-100% authenticity confidence metric

### Blockchain Integration
- ✅ **Simulation Mode** (Default) - No blockchain setup required, instant verification
- ✅ **Ethereum Support** (Testnet) - Real smart contract calls on Sepolia testnet
- ⏳ **Hyperledger Fabric** (Planned) - Not yet implemented, currently uses simulation
- ✅ **Transaction Tracking** - Blockchain metadata storage (for Ethereum)
- ✅ **Mock Transactions** - Simulated hashes for testing without blockchain

### Security & Access Control
- ✅ **Role-Based Access** - Admin and user roles with appropriate permissions
- ✅ **Password Hashing** - bcryptjs for secure credential storage
- ✅ **Session Management** - NextAuth.js for authentication and authorization
- ✅ **Rate Limiting** - Request throttling to prevent abuse
- ✅ **Private Key Protection** - Environment variable-based secret management

### User Experience
- ✅ **Drag & Drop Upload** - Intuitive file upload interface
- ✅ **Responsive Design** - Mobile-optimized using Tailwind CSS
- ✅ **Admin Dashboard** - Manage certificates and view blockchain metadata
- ✅ **Multi-Format Support** - PDF, PNG, JPG, JPEG documents
- ✅ **Dark Mode Support** - System-aware theme switching

---

## Tech Stack

### Frontend
- **Next.js 16** - React metaframework with App Router
- **TypeScript 5** - Type-safe JavaScript development
- **Tailwind CSS 4** - Utility-first styling framework
- **shadcn/ui** - High-quality Radix UI component library
- **Framer Motion** - Smooth animations and transitions
- **React Hook Form** - Performant form state management
- **Zod** - TypeScript-first schema validation

### Backend
- **Next.js API Routes** - Serverless backend functions
- **Prisma 6** - Type-safe ORM for database operations
- **NextAuth.js 4** - Complete authentication solution
- **bcryptjs** - Password hashing and verification
- **Rate Limiter** - Custom request throttling

### Database
- **SQLite (Development)** - Lightweight local development
- **PostgreSQL (Production)** - Recommended for production deployments
- **Prisma Migrations** - Schema versioning and deployments
- **Seed Data** - Pre-populated test credentials

### Blockchain Integration
- **ethers.js 6** - Ethereum Web3 library (for Ethereum mode)
- **Simulation Mode** - No external blockchain required for testing

### DevTools
- **ESLint 9** - Code quality linting
- **Bun** - Fast JavaScript runtime (package manager)
- **ts-node** - TypeScript execution for scripts
- **Caddy** - Reverse proxy and HTTPS server

---

## System Architecture

### Verification Workflow

```
User Upload
    ↓
File Processing & SHA-256 Hash Generation
    ↓
Database Lookup
    ├─ Found: Retrieve stored certificate
    └─ Not Found: Generate new certificate code
    ↓
Blockchain Verification (if enabled)
    ├─ ETHEREUM: ethers.js smart contract call
    └─ SIMULATION: In-memory transaction simulation
    ↓
Return Verification Result
    ├─ Status (Verified / Suspicious / Not Found)
    ├─ Confidence Score
    ├─ Blockchain Proof (TX Hash)
    └─ Certificate Details
```

### Backend Architecture

```
API Routes (src/app/api/)
    ├─ /verify → Verification endpoint
    └─ /certificates → Admin certificate management
        ↓
    Blockchain Service (src/lib/blockchain.service.ts)
        ├─ registerCertificate()
        ├─ verifyCertificate()
        └─ getBlockchainStatus()
        ↓
    Blockchain Config (src/lib/blockchain.config.ts)
        └─ Route to ETHEREUM or SIMULATION
        ↓
    Verification Logic (src/lib/verification.ts)
        ├─ computeHash() → SHA-256
        ├─ findMatches() → Database lookup
        └─ calculateConfidence() → Fuzzy matching
        ↓
    Database (Prisma)
        └─ SQLite (dev) → Production SQL database
```

### Data Models

**User** (NextAuth)
- Email, password, role (admin/user), session tokens

**Certificate**
- ID, institutionId, studentName, degree, year
- hash (SHA-256), blockchainTxHash
- created/updated timestamps

**Institution**
- ID, name, city, country, verificationStatus

---

## Installation & Setup

### Prerequisites
- Node.js 18+ or Bun 1.0+
- Git
- (Optional) Alchemy account for Ethereum testnet

### Quick Start (Simulation Mode - No Blockchain Required)

```bash
# 1. Clone repository
git clone https://github.com/ckmr27/AVA-Secure-Document-Verification.git
cd AVA-Secure-Document-Verification

# 2. Copy environment template and edit as needed
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Setup database
npm run db:push

# 5. (Optional) Seed with test data
npx ts-node prisma/seed.ts

# 6. Start development server
npm run dev

# Access at http://localhost:3000
# Login: admin@ava.com / admin123 (if configured in .env)
```

### Ethereum Testnet Setup

```bash
# 1. Create .env from example
cp .env.example .env

# 2. Edit .env with:
BLOCKCHAIN_TYPE=ETHEREUM
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
ETHEREUM_API_KEY=YOUR_ALCHEMY_API_KEY
ETHEREUM_CONTRACT_ADDRESS=0xYourDeployedContractAddress
ETHEREUM_PRIVATE_KEY=YourPrivateKey

# 3. Deploy smart contract (see docs)
# 4. Start
npm run dev
```

**Smart Contract Deployment Guide:**
See BLOCKCHAIN_SETUP.md for complete instructions on deploying to Ethereum testnet.

---

## Usage

### For Users: Verify a Certificate

1. **Access the application** at `http://localhost:3000`
2. **Navigate to Verification** page
3. **Upload document** via drag-and-drop or file browser
   - Supported: PDF, PNG, JPG, JPEG
4. **View results**:
   - Status badge (Verified/Suspicious/Not Found)
   - Confidence score
   - Blockchain transaction hash (if Ethereum mode)
   - Certificate details (if verified)

### For Administrators: Manage Certificates

1. **Login** with admin credentials (from .env)
2. **Navigate to Admin Dashboard**
3. **Add Certificate**:
   - Enter: Student name, degree, year, institution
   - Select blockchain (ETHEREUM/SIMULATION)
   - Submit → Certificate registered on blockchain
4. **View All Certificates**:
   - See blockchain metadata
   - Monitor verification history

### API Endpoints

#### POST /api/verify
Verify a certificate by file upload or certificate code.

**Request:**
```json
{
  "fileContent": "base64_encoded_pdf",
  "certCode": "optional_code"
}
```

**Response:**
```json
{
  "status": "verified",
  "confidence": 95,
  "blockchainHash": "0x1234...",
  "blockchainType": "ETHEREUM",
  "certificateDetails": {
    "studentName": "John Doe",
    "degree": "Bachelor of Science",
    "year": 2023,
    "institution": "MIT"
  },
  "isNew": false
}
```

#### POST /api/certificates
Create and register a new certificate (admin only).

**Request:**
```json
{
  "studentName": "Jane Smith",
  "degree": "Master of Arts",
  "year": 2024,
  "institutionId": "inst-001"
}
```

#### GET /api/certificates
List all certificates with blockchain metadata (admin only).

---

## Blockchain Implementation Status

### ✅ Simulation Mode (Default)
- **Status:** Fully functional
- **Setup Required:** None
- **Use Case:** Development, testing, demonstrations
- **Features:** 
  - Auto-generates mock transaction hashes
  - No external dependencies
  - Instant verification

### ✅ Ethereum Integration (Testnet)
- **Status:** Working on Sepolia testnet
- **Setup Required:** Alchemy API key + smart contract deployment
- **Use Case:** Real blockchain verification on testnet
- **Features:**
  - Real smart contract calls
  - Actual transaction hashes
  - Block number tracking
- **Limitations:** Testnet only, gas fees apply, not suitable for production without audit

### ⏳ Hyperledger Fabric (Planned)
- **Status:** Not yet implemented
- **Current Behavior:** Falls back to simulation mode
- **Why Not Included:** Requires Docker + complex network setup
- **Future Timeline:** Contributions welcome

**Current Default:** BLOCKCHAIN_TYPE=SIMULATION (recommended for development)

---

## Folder Structure

```
AVA-Secure-Document-Verification/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   ├── verify/route.ts      # Verification endpoint
│   │   │   ├── certificates/route.ts # Admin endpoint
│   │   │   └── auth/                # NextAuth handlers
│   │   ├── page.tsx                 # Home page
│   │   └── layout.tsx               # Root layout
│   │
│   ├── components/                   # React components
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── VerificationForm.tsx      # File upload component
│   │   ├── CertificateList.tsx       # Admin dashboard
│   │   └── BlockchainStatus.tsx      # Blockchain info display
│   │
│   ├── hooks/                        # Custom React hooks
│   │
│   ├── lib/
│   │   ├── blockchain.config.ts      # Blockchain configuration
│   │   ├── blockchain.service.ts     # Unified blockchain interface
│   │   ├── verification.ts           # Verification logic (SHA-256, fuzzy matching)
│   │   ├── auth-options.ts           # NextAuth configuration
│   │   ├── db.ts                     # Prisma client
│   │   ├── rate-limiter.ts           # Request throttling
│   │   ├── schemas.ts                # Zod validation schemas
│   │   └── utils.ts                  # Helper functions
│   │
│   └── middleware.ts                 # Next.js middleware (auth)
│
├── prisma/
│   ├── schema.prisma                # Database schema
│   ├── seed.ts                      # Test data seeding
│   ├── migrations/                  # Migration history
│   └── dev.db                       # SQLite development database
│
├── public/                           # Static assets
├── db/                               # Database storage
├── download/                         # Downloaded certificates
│
├── .env.example                     # Environment variables template
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies
│
├── BLOCKCHAIN_SETUP.md              # Blockchain setup instructions
├── DEPLOYMENT.md                    # Production deployment
└── README.md                        # This file
```

---

## Security & Authentication

### Authentication Flow

1. **Login**: User/admin credentials → NextAuth.js
2. **Password Hashing**: bcryptjs (salt rounds: 10)
3. **Session Creation**: JWT token + database session
4. **Middleware Protection**: src/middleware.ts validates token per request
5. **Role-Based Access**: Admin-only endpoints checked server-side

### Blockchain Security

- ✅ **Private Keys**: Never hardcoded—stored in `.env` only
- ✅ **Smart Contract Security**: Use OpenZeppelin patterns (if deployed)
- ✅ **Immutable Records**: Blockchain provides tamper-proof storage (Ethereum)

### Rate Limiting

- Custom in-memory rate limiter (src/lib/rate-limiter.ts)
- Limits: 5 login attempts per IP per 15 minutes
- Prevents brute force attacks and abuse

### Best Practices

- ❌ Never commit `.env` or private keys
- ✅ Use testnet (Sepolia) before mainnet
- ✅ Rotate sensitive credentials regularly
- ✅ Monitor blockchain gas usage
- ✅ Audit smart contracts before production

---

## Future Improvements

### Short Term
- [ ] Certificate revocation mechanism (blacklisting)
- [ ] Batch certificate upload (CSV import)
- [ ] Email notifications on verification events
- [ ] PDF certificate generation with embedded QR codes
- [ ] Multi-language support (i18n)

### Medium Term
- [ ] IPFS integration for document storage
- [ ] Advanced analytics dashboard
- [ ] Integration with educational institutions' credential systems
- [ ] Mobile app (React Native)
- [ ] API key management for third-party integrations

### Long Term
- [ ] Decentralized identity (DID) integration
- [ ] Zero-knowledge proofs for privacy-preserving verification
- [ ] Machine learning for document forgery detection
- [ ] Hyperledger Fabric implementation
- [ ] Multi-chain support (bridging)

---

## Deployment

### Development
```bash
npm run dev      # Start dev server on port 3000
npm run lint     # Check code quality
```

### Production
```bash
npm run build    # Create optimized build
npm start        # Start production server on port 3000
```

**Deployment Platforms:**
- Vercel (recommended for Next.js)
- AWS EC2 / ECS
- Google Cloud Run
- DigitalOcean App Platform

See **DEPLOYMENT.md** for platform-specific guides, environment configuration, and scaling strategies.

---

## Environment Variables

### Core (Required)
```
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=file:./prisma/dev.db
```

### Blockchain (Choose One)
```
# Simulation (default)
BLOCKCHAIN_TYPE=SIMULATION

# Ethereum
BLOCKCHAIN_TYPE=ETHEREUM
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHEREUM_API_KEY=YOUR_ALCHEMY_KEY
ETHEREUM_CONTRACT_ADDRESS=0xYourContractAddress
ETHEREUM_PRIVATE_KEY=YourPrivateKey
```

See **.env.example** for complete configuration options.

---

## Testing

### Scenario 1: Verification (New Document)
1. Upload a PDF
2. Verify that a new certificate code is auto-generated
3. Confirm blockchain registration (check TX hash in simulation mode)

### Scenario 2: Verification (Known Document)
1. Upload same PDF again
2. Verify that same certificate code is returned

### Scenario 3: Blockchain Mode Switching
1. Register with SIMULATION
2. Access dashboard - see simulated transaction hashes

---

## Known Limitations & Assumptions

### Assumptions Made
- **Local Development**: SQLite database used (production requires PostgreSQL)
- **File Storage**: Documents stored in `/download` directory (production requires S3/cloud storage)
- **Blockchain**: Ethereum Sepolia testnet used for development (mainnet requires capital)
- **Institution Data**: Pre-seeded via `prisma/seed.ts` (production requires institution management system)

### Limitations
- Ethereum integration tested on testnet only (not mainnet-ready without audit)
- Simulation mode transactions are mocked (not on actual blockchain)
- No certificate revocation (immutable blockchain limitation)
- No batch processing (certificates registered one-at-a-time)
- Hyperledger Fabric not yet implemented

---

## Contributing

This is a personal portfolio project. For suggestions or improvements:
1. Review codebase structure
2. Identify improvements
3. Document clearly in issue/PR

---

## License

This project is provided as-is for educational and portfolio purposes. No explicit license specified. Modify and use as needed.

---

## Support & Resources

### Blockchain Providers
- **Ethereum**: [Alchemy](https://www.alchemy.com/) | [Infura](https://www.infura.io/)
- **Smart Contracts**: [Remix IDE](https://remix.ethereum.org/) | [OpenZeppelin](https://docs.openzeppelin.com/)

### Web3 Libraries
- [ethers.js Documentation](https://docs.ethers.org/)

### Development
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Prisma ORM](https://www.prisma.io/docs/)
- [NextAuth.js](https://next-auth.js.org/)

### Additional Documentation
- **BLOCKCHAIN_SETUP.md** - Ethereum smart contract deployment
- **DEPLOYMENT.md** - Production deployment walkthrough

---

## Project Status

✅ **Ready for Development & Testing**

- Core verification functionality: ✅ Working
- Simulation blockchain: ✅ Working
- Ethereum testnet support: ✅ Implemented (requires setup)
- Authentication: ✅ Secure
- Documentation: ✅ Honest about capabilities

**Not Production-Ready For:**
- Ethereum mainnet (needs audit)
- Hyperledger Fabric (not implemented)
- Large-scale deployments (no scaling configured)

**Last Updated:** May 2026
**Version:** 0.2.0

---

**Built with Next.js 16, TypeScript, Tailwind CSS, Prisma, and Blockchain Integration** 🚀
