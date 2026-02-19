# Authenticity Validator for Academia (AVA)

Enterprise-grade academic credential verification platform built with Next.js 16, TypeScript, Prisma, and modern web technologies.

## 🎯 Overview

AVA is a comprehensive web application designed to combat academic document fraud through advanced digital verification technologies. The platform provides secure, tamper-proof verification of academic credentials using OCR, cryptographic hashing, blockchain anchoring, and AI-powered fraud detection.

## ✨ Key Features

### 🔐 Role-Based Access Control
- **User Login**: For employers and verifiers to upload and verify certificates
- **Admin Login**: For authorized academic institutions to manage certificate records

### 📄 Document Verification
- Upload certificate images or PDFs
- Enter certificate ID for instant verification
- OCR-based text extraction
- Fuzzy matching for error tolerance
- SHA-256 cryptographic hashing
- Blockchain-anchored verification
- Tamper detection with confidence scoring

### 🏛️ Admin Dashboard
- Add new certificate records
- Upload certificate files
- Generate certificate hashes
- View all issued certificates
- Blockchain transaction tracking
- Institution management

### 👤 User Dashboard
- Quick verification access
- Document upload interface
- Verification history
- Status badges and detailed results

### 🎨 Professional UI/UX
- Deep blue + white corporate SaaS design
- Card-based sections with soft shadows
- Smooth hover effects and transitions
- Fully responsive layout
- Mobile-friendly navigation
- Real-time status updates

## 🛠️ Technology Stack

### Core Framework
- **Next.js 16** with App Router
- **TypeScript 5**
- **Tailwind CSS 4**

### Database & ORM
- **Prisma ORM**
- **SQLite** (development)

### UI Components
- **shadcn/ui** component library
- **Lucide React** icons
- **Framer Motion** animations

### Verification Technologies
- **SHA-256 Hashing**: Document fingerprinting
- **Levenshtein Distance**: Fuzzy matching algorithms
- **OCR Simulation**: Text extraction (simulated)
- **Blockchain Anchoring**: Immutable record storage (simulated)
- **IPFS**: Distributed storage (simulated)
- **CNN Forensics**: Tamper detection (simulated)

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun

### Installation Steps

1. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

2. **Configure environment**
   ```bash
   # Copy .env.example if it exists
   # DATABASE_URL is already configured for SQLite
   ```

3. **Initialize database**
   ```bash
   # Push Prisma schema to database
   bun run db:push

   # Seed database with test data
   bun run prisma/seed.ts
   ```

4. **Start development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Access the application**
   - Open your browser to the provided local URL
   - The application will be available at `http://localhost:3000`

## 🚀 Usage Guide

### Demo Accounts

The database comes pre-seeded with test accounts:

#### Admin Account
- **Email**: admin@university.edu
- **Password**: admin123
- **Role**: Administrator
- **Capabilities**: Add certificates, manage records, view all certificates

#### User Account
- **Email**: user@company.com
- **Password**: user123
- **Role**: User
- **Capabilities**: Verify certificates, view verification history

### Sample Certificate Codes

The seed script creates 5 sample certificates:
- `CERT-2024-001` - John Smith, Bachelor of Science in Computer Science
- `CERT-2024-002` - Emily Johnson, Master of Business Administration
- `CERT-2024-003` - Michael Chen, Bachelor of Arts in Economics
- `CERT-2024-004` - Sarah Williams, Master of Science in Data Science
- `CERT-2024-005` - David Brown, Bachelor of Engineering in Civil Engineering

### How to Use

#### 1. Landing Page
- Browse platform features and benefits
- Click "Verify Document" to access verification
- Click "Login" to access dashboard

#### 2. Verification (Public Access)
- Navigate to "Verify Document"
- Enter a certificate code (e.g., `CERT-2024-001`)
- Or upload a certificate image/PDF
- Click "Verify Document"
- View verification results with confidence score

#### 3. User Dashboard
- Log in with user credentials
- Access quick verification tools
- View verification history
- Upload documents for verification

#### 4. Admin Dashboard
- Log in with admin credentials
- Click "Add Certificate" to issue new credentials
- Fill in student details, degree, year, and certificate code
- View all issued certificates in the list
- Track blockchain transactions

## 📁 Project Structure

```
/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts      # Login endpoint
│   │   │   │   ├── logout/route.ts     # Logout endpoint
│   │   │   │   └── me/route.ts         # Session endpoint
│   │   │   ├── certificates/
│   │   │   │   ├── route.ts            # CRUD operations
│   │   │   │   └── [certCode]/route.ts # Get by code
│   │   │   └── verify/
│   │   │       └── route.ts            # Verification endpoint
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main application page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts              # Authentication utilities
│   │   ├── db.ts                # Prisma client
│   │   ├── utils.ts             # Utility functions
│   │   └── verification.ts      # Verification logic
│   └── hooks/                   # React hooks
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current session

### Certificates (Admin Only)
- `GET /api/certificates` - List all certificates
- `POST /api/certificates` - Create new certificate
- `GET /api/certificates/[certCode]` - Get certificate by code

### Verification (Public)
- `POST /api/verify` - Verify a certificate

## 🔒 Security Features

### Authentication
- Session-based authentication using HTTP-only cookies
- Role-based access control (RBAC)
- Secure password hashing with SHA-256

### Verification
- SHA-256 cryptographic hashing for document fingerprinting
- Levenshtein distance for fuzzy text matching
- Blockchain anchoring for immutable records
- OCR extraction with error tolerance
- Confidence scoring for reliability

### Data Protection
- SQL injection protection via Prisma ORM
- XSS protection via React
- CSRF protection via same-site cookies
- Secure session management

## 🎨 Design System

### Color Palette
- **Primary**: Blue-600 to Blue-800 gradient
- **Background**: Slate-50 to Blue-50 gradient
- **Text**: Slate-900 (headings), Slate-600 (body)
- **Success**: Green-100 to Green-700
- **Warning**: Yellow-100 to Yellow-700
- **Error**: Red-100 to Red-700

### Typography
- **Headings**: Bold, large font sizes (3xl to 6xl)
- **Body**: Regular weight, comfortable line height
- **Code**: Monospace font for IDs and hashes

### Components
- Card-based layout with consistent padding (p-4, p-6)
- Rounded corners and subtle shadows
- Hover effects with color transitions
- Responsive grid layouts

## 🧪 Testing the Application

### Test Verification Flow
1. Go to "Verify Document"
2. Enter certificate code: `CERT-2024-001`
3. Click "Verify Document"
4. View verified result with 100% confidence

### Test Admin Flow
1. Login as admin: `admin@university.edu` / `admin123`
2. Click "Add Certificate"
3. Fill in details:
   - Student Name: Test Student
   - Degree: Bachelor of Science
   - Year: 2024
   - Certificate Code: CERT-TEST-001
   - Institution: Test University
4. Submit form
5. Verify the certificate appears in the list

### Test User Flow
1. Login as user: `user@company.com` / `user123`
2. Access verification dashboard
3. Upload or verify certificates
4. View verification history

## 🔧 Development

### Available Scripts
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run db:push` - Push Prisma schema to database
- `bun run prisma/seed.ts` - Seed database

### Code Style
- TypeScript strict mode enabled
- ESLint with Next.js rules
- Tailwind CSS for styling
- shadcn/ui for components

## 📊 Database Schema

### Users
- `id`: Primary key (CUID)
- `email`: Unique email address
- `name`: Full name
- `password`: Hashed password
- `role`: USER or ADMIN

### Institutions
- `id`: Primary key (CUID)
- `name`: Institution name (unique)
- `blockchainId`: Blockchain identifier

### Certificates
- `id`: Primary key (CUID)
- `studentName`: Full student name
- `degree`: Degree title
- `year`: Graduation year
- `certCode`: Certificate code (unique)
- `fileHash`: SHA-256 hash
- `ipfsLink`: IPFS storage hash
- `blockchainTxHash`: Blockchain transaction ID
- `institutionId`: Foreign key to Institution
- `uploadedBy`: Foreign key to User

## 🚀 Deployment

### Environment Variables
```
DATABASE_URL=file:./db/custom.db
NODE_ENV=production
```

### Build Steps
```bash
# Build application
bun run build

# Push schema to production database
bun run db:push

# Seed production database (optional)
bun run prisma/seed.ts

# Start production server
bun run start
```

## 📝 License

This project is for demonstration purposes.

## 🤝 Contributing

This is a demonstration project showcasing modern web development practices.

---

**Built with ❤️ using Next.js 16, TypeScript, and Prisma**
