'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Shield, FileCheck, Link, Lock, Zap, Users, CheckCircle2,
  ArrowRight, Upload, Search, AlertTriangle, XCircle, Download,
  Plus, LogOut, Menu, X
} from 'lucide-react'

type View = 'landing' | 'login' | 'verify' | 'admin-dashboard' | 'user-dashboard'

interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
}

interface Certificate {
  id: string
  studentName: string
  degree: string
  year: number
  certCode: string
  fileHash: string
  blockchainTxHash: string | null
  ipfsLink: string | null
  institution: {
    name: string
    blockchainId: string
  }
  createdAt: string
}

interface VerificationResult {
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
  blockchainTxHash?: string
  similarities: {
    studentName: number
    degree: number
  }
  message?: string
  isNewCertificate?: boolean
}

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('landing')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setUser(data.user)

      if (data.user.role === 'ADMIN') {
        setCurrentView('admin-dashboard')
      } else {
        setCurrentView('user-dashboard')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setCurrentView('landing')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (currentView === 'login') {
    return <LoginForm onBack={() => setCurrentView('landing')} onLogin={handleLogin} loading={loading} error={error} />
  }

  if (currentView === 'verify') {
    return <VerifyPage onBack={() => {
      if (user) {
        setCurrentView(user.role === 'ADMIN' ? 'admin-dashboard' : 'user-dashboard')
      } else {
        setCurrentView('landing')
      }
    }} />
  }

  if (currentView === 'admin-dashboard' && user?.role === 'ADMIN') {
    return <AdminDashboard user={user} onLogout={handleLogout} />
  }

  if (currentView === 'user-dashboard' && user) {
    return <UserDashboard user={user} onLogout={handleLogout} onVerify={() => setCurrentView('verify')} />
  }

  return <LandingPage onLogin={() => setCurrentView('login')} onVerify={() => setCurrentView('verify')} />
}

function LandingPage({ onLogin, onVerify }: { onLogin: () => void; onVerify: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation onLogin={onLogin} onVerify={onVerify} />

      <main className="flex-1">
        <HeroSection onVerify={onVerify} />
        <ProblemSection />
        <BenefitsSection />
        <HowItWorksSection />
        <TechnologySection />
        <CTASection onVerify={onVerify} />
      </main>

      <Footer />
    </div>
  )
}

function Navigation({ onLogin, onVerify }: { onLogin: () => void; onVerify: () => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              AVA
            </span>
            <span className="text-sm text-slate-500 ml-2 hidden sm:block">
              Authenticity Validator for Academia
            </span>
          </div>

          <div className="hidden sm:flex gap-3">
            <Button variant="ghost" onClick={onLogin} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              Login
            </Button>
            <Button onClick={onVerify} className="bg-blue-600 hover:bg-blue-700 text-white">
              Verify Document
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="sm:hidden mt-4 pb-4 flex flex-col gap-2">
            <Button variant="ghost" onClick={() => { onLogin(); setIsMobileMenuOpen(false) }} className="justify-start">
              Login
            </Button>
            <Button onClick={() => { onVerify(); setIsMobileMenuOpen(false) }} className="w-full">
              Verify Document
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}

function HeroSection({ onVerify }: { onVerify: () => void }) {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto text-center max-w-4xl">
        <Badge className="mb-4 bg-white/10 text-blue-100 border border-white/10">
          Enterprise-Grade Security
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
          Secure Digital Verification of
          <span className="block bg-gradient-to-r from-white/80 to-white/60 bg-clip-text text-transparent">
            Academic Credentials
          </span>
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          Combat academic document fraud with advanced OCR, cryptographic hashing,
          and blockchain-anchored verification. Trust in every certificate.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={onVerify}
            className="bg-white text-blue-600 hover:bg-white/90 px-8 py-6 text-lg"
          >
            <FileCheck className="mr-2 h-5 w-5" />
            Verify a Document
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={onVerify}
            className="border-2 border-white text-white bg-transparent hover:bg-white/10 px-8 py-6 text-lg"
          >
            <Search className="mr-2 h-5 w-5 text-white" />
            Try Demo
          </Button>
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-slate-900">
            The Verification Challenge
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Academic fraud costs institutions and employers millions annually
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Document Fraud</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Fake diplomas and transcripts are increasingly sophisticated, making manual verification nearly impossible.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Manual Delays</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Traditional verification takes weeks, slowing down hiring and enrollment processes significantly.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">Lack of Trust</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                No unified, tamper-proof system exists to definitively prove credential authenticity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function BenefitsSection() {
  const benefits = [
    { icon: Zap, title: 'Instant Verification', desc: 'Verify credentials in seconds, not weeks' },
    { icon: Shield, title: 'Tamper-Proof', desc: 'Blockchain-anchored records cannot be forged' },
    { icon: Link, title: 'OCR Extraction', desc: 'Automatic text extraction from scanned documents' },
    { icon: CheckCircle2, title: 'Forensic Analysis', desc: 'AI-powered tamper detection on document images' },
  ]

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Why Choose AVA?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Comprehensive security powered by cutting-edge technology
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
            >
              <benefit.icon className="h-8 w-8 mb-4 text-blue-200" />
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-blue-100">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    { num: 1, title: 'Upload Document', desc: 'Upload a certificate image or PDF for instant analysis' },
    { num: 2, title: 'AI Verification', desc: 'OCR extracts data, fuzzy matching compares, blockchain verifies' },
    { num: 3, title: 'Get Results', desc: 'Receive verification status with confidence score instantly' },
  ]

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-slate-900">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Simple, secure, and transparent verification process
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className={`relative inline-block ${index < steps.length - 1 ? '' : ''}`}>
                <div className={`h-20 w-20 ${step.num === 3 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <span className="text-3xl font-bold">{step.num}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-transparent -translate-x-1/2"></div>
                )}
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-900">{step.title}</h3>
              <p className="text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TechnologySection() {
  const techs = [
    {
      icon: FileCheck,
      title: 'OCR & Text Extraction',
      items: ['Advanced character recognition for scanned documents', 'Supports multiple image formats and PDF', 'Automatic field detection and extraction'],
    },
    {
      icon: Lock,
      title: 'Cryptographic Security',
      items: ['SHA-256 hashing for document fingerprinting', 'Blockchain anchoring for immutable records', 'Levenshtein distance for fuzzy matching'],
    },
    {
      icon: Shield,
      title: 'Fraud Detection',
      items: ['CNN-based image forensics for tamper detection', 'Seal and signature authenticity analysis', 'Confidence scoring for each verification'],
    },
    {
      icon: Link,
      title: 'Distributed Storage',
      items: ['IPFS for decentralized document storage', 'Redundant storage across multiple nodes', 'Content-addressable file retrieval'],
    },
  ]

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-slate-900">
            Technology Stack
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Enterprise-grade security through multi-layered technology
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {techs.map((tech, index) => (
            <Card key={index} className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <tech.icon className="h-5 w-5 text-blue-600" />
                  {tech.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tech.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection({ onVerify }: { onVerify: () => void }) {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Verify with Confidence?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join institutions worldwide in securing academic credentials
        </p>
        <Button
          size="lg"
          onClick={onVerify}
          className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
        >
          Verify Your First Document
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">AVA</span>
            </div>
            <p className="text-sm">
              Enterprise-grade academic credential verification platform
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Verification</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">API Access</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Security</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Technology</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Compliance</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>support@ava-platform.com</li>
              <li>1-800-AVA-VERIFY</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-sm">
          <p>&copy; 2025 Authenticity Validator for Academia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

function LoginForm({ onBack, onLogin, loading, error }: {
  onBack: () => void
  onLogin: (email: string, password: string) => void
  loading: boolean
  error: string
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <div className="min-h-screen flex flex-col gradient-premium-blue relative overflow-hidden">
      {/* Animated gradient overlays */}
      <div className="absolute inset-0 animate-glass-float opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animation-delay-2000"></div>
      </div>

      <nav className="border-b glass-effect relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              AVA
            </span>
          </div>
          <Button variant="ghost" onClick={onBack}>
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Back
          </Button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <Card className="w-full max-w-md glass-effect shadow-2xl border-0 animate-glass-fade">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-slate-900 bg-clip-text text-transparent">Sign In to AVA</CardTitle>
            <CardDescription className="text-slate-700">
              Access the secure credential verification platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="glass-effect-dark border-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Email</label>
                <Input
                  type="email"
                  placeholder="admin@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-white/30 glass-effect-light"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-white/30 glass-effect-light"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-6 text-lg shadow-lg"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm text-slate-700 space-y-2">
                <p className="font-semibold">Demo Accounts:</p>
                <p className="font-mono text-xs glass-effect-light p-2 rounded">
                  Admin: admin@university.edu / admin123
                </p>
                <p className="font-mono text-xs glass-effect-light p-2 rounded">
                  User: user@company.com / user123
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

function VerifyPage({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setResult(null) // Clear previous result
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null) // Clear previous result
    }
  }

  const handleVerify = async () => {
    if (!file) {
      alert('Please upload a certificate file to verify')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const fileContent = await file.text()

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent: fileContent,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Verification error:', error)
      alert('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col gradient-premium-dark relative overflow-hidden">
      {/* Animated gradient overlays */}
      <div className="absolute inset-0 animate-glass-float opacity-30">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      </div>

      <nav className="border-b glass-effect-dark relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-cyan-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AVA
            </span>
          </div>
          <Button variant="ghost" onClick={onBack} className="text-white hover:text-cyan-300">
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Back
          </Button>
        </div>
      </nav>

      <div className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-white">Verify Credential</h1>
            <p className="text-lg text-cyan-100">
              Upload a certificate for instant verification. Certificate code will be auto-generated.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="glass-effect-dark border-0 shadow-2xl animate-glass-fade">
              <CardHeader>
                <CardTitle className="text-white">Upload Certificate</CardTitle>
                <CardDescription className="text-cyan-100">Upload to verify or create new certificate</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${dragActive ? 'border-cyan-400 bg-cyan-400/10' : 'border-cyan-300/50 hover:border-cyan-400'
                    } glass-effect-light`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <Upload className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-slate-900">
                      {file ? file.name : 'Drop your certificate here'}
                    </h3>
                    <p className="text-slate-700 mb-4">
                      {file ? 'File selected' : 'or click to browse files'}
                    </p>
                    <p className="text-sm text-slate-600">
                      Supports PDF, PNG, JPG, JPEG (Max 10MB)
                    </p>
                  </label>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 py-6 text-lg shadow-lg font-semibold"
                  onClick={handleVerify}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Verify Document
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {result && (
              <VerificationResultCard result={result} />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function VerificationResultCard({ result }: { result: VerificationResult }) {
  const statusConfig = {
    verified: {
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: CheckCircle2,
      title: 'Verified',
      description: 'This certificate has been successfully verified',
    },
    suspicious: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      icon: AlertTriangle,
      title: 'Suspicious',
      description: 'This certificate shows signs of potential tampering',
    },
    not_found: {
      color: 'bg-red-100 text-red-700 border-red-300',
      icon: XCircle,
      title: 'Not Found',
      description: 'No matching certificate found in the database',
    },
  }

  const config = statusConfig[result.status]
  const Icon = config.icon

  return (
    <Card className={`glass-effect-dark border-0 shadow-2xl mt-6 animate-glass-fade ${config.color}`}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-6 w-6" />
          <Badge className={config.color}>{config.title}</Badge>
        </div>
        <CardDescription className="text-white">{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-white">Confidence Score</span>
            <span className="text-sm font-bold text-cyan-300">{result.confidence}%</span>
          </div>
          <Progress value={result.confidence} className="h-2" />
        </div>

        {result.status === 'verified' && (
          <div className="space-y-3 pt-4 border-t border-white/20">
            <div className="flex justify-between">
              <span className="text-sm text-cyan-100">Student Name:</span>
              <span className="text-sm font-medium text-white">{result.details.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-cyan-100">Institution:</span>
              <span className="text-sm font-medium text-white">{result.details.institution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-cyan-100">Degree:</span>
              <span className="text-sm font-medium text-white">{result.details.degree}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-cyan-100">Year:</span>
              <span className="text-sm font-medium text-white">{result.details.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-cyan-100">Certificate Code:</span>
              <span className="text-sm font-medium font-mono text-cyan-300">{result.details.certCode}</span>
            </div>
          </div>
        )}

        {result.blockchainVerified && result.blockchainTxHash && (
          <Alert className="glass-effect-light border-cyan-300/30">
            <Shield className="h-4 w-4 text-cyan-600" />
            <AlertDescription className="text-xs break-all text-cyan-900">
              Blockchain Verified • TX: {result.blockchainTxHash}
            </AlertDescription>
          </Alert>
        )}

        {result.forensicScore > 0 && (
          <Alert className="glass-effect-light border-yellow-300/30">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              Tamper Risk Score: {result.forensicScore}%
            </AlertDescription>
          </Alert>
        )}

        {result.message && (
          <Alert className="glass-effect-light border-green-300/30">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        {result.status === 'verified' && result.details.certCode && (
          <Alert className="bg-blue-50 text-blue-700 border-blue-300">
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Your Certificate Code:</span>
                  <span className="font-mono text-lg font-bold bg-blue-100 px-3 py-1 rounded">
                    {result.details.certCode}
                  </span>
                </div>
                <div className="text-sm text-blue-600">
                  {result.isNewCertificate ? '✓ New certificate created and blockchain-anchored!' : '✓ Existing certificate verified!'}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

function AdminDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadCertificates()
  }, [])

  const loadCertificates = async () => {
    try {
      const response = await fetch('/api/certificates')
      if (response.ok) {
        const data = await response.json()
        setCertificates(data.certificates)
      }
    } catch (error) {
      console.error('Failed to load certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCertificate = async (formData: any) => {
    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowAddForm(false)
        loadCertificates()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to add certificate')
      }
    } catch (error) {
      console.error('Failed to add certificate:', error)
      alert('Failed to add certificate')
    }
  }

  return (
    <div className="min-h-screen flex flex-col gradient-premium-blue relative overflow-hidden">
      {/* Animated gradient overlays */}
      <div className="absolute inset-0 animate-glass-float opacity-20">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      </div>

      <DashboardNav user={user} onLogout={onLogout} />

      <div className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-cyan-100">Manage certificate records</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 shadow-lg font-semibold"
          >
            {showAddForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showAddForm ? 'Cancel' : 'Add Certificate'}
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8 glass-effect-light border-0 shadow-2xl animate-glass-fade">
            <CardHeader>
              <CardTitle className="text-slate-900">Add New Certificate</CardTitle>
              <CardDescription className="text-slate-700">Issue a new credential record</CardDescription>
            </CardHeader>
            <CardContent>
              <AddCertificateForm onSubmit={handleAddCertificate} onCancel={() => setShowAddForm(false)} />
            </CardContent>
          </Card>
        )}

        <Card className="glass-effect-light border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-slate-900">Issued Certificates</CardTitle>
            <CardDescription className="text-slate-700">Total: {certificates.length} records</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : certificates.length === 0 ? (
              <Alert className="glass-effect-light">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-slate-700">No certificates found. Add your first certificate to get started.</AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4 pr-4">
                  {certificates.map((cert) => (
                    <CertificateCard key={cert.id} certificate={cert} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

function UserDashboard({ user, onLogout, onVerify }: { user: User; onLogout: () => void; onVerify: () => void }) {
  return (
    <div className="min-h-screen flex flex-col gradient-premium-light relative overflow-hidden">
      {/* Animated gradient overlays */}
      <div className="absolute inset-0 animate-glass-float opacity-25">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      </div>

      <DashboardNav user={user} onLogout={onLogout} />

      <div className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-slate-900">Verification Dashboard</h1>
            <p className="text-lg text-slate-700">
              Welcome, {user.name}. Verify academic credentials with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card
              className="glass-effect-light border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
              onClick={onVerify}
            >
              <CardContent className="p-8 text-center">
                <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload Document</h3>
                <p className="text-slate-700">
                  Upload a certificate image or PDF for verification
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect-light border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-8 text-center">
                <Search className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Search by Code</h3>
                <p className="text-slate-700">
                  Enter certificate code to verify instantly
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-effect-light border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-900">Recent Verifications</CardTitle>
              <CardDescription className="text-slate-700">Your verification history</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="glass-effect-light border-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-slate-700">
                  No recent verifications. Upload a certificate to get started.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function DashboardNav({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <nav className="border-b glass-effect sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              AVA
            </span>
            <Badge variant="outline" className="ml-4 glass-effect">
              {user.role === 'ADMIN' ? 'Admin' : 'User'}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-slate-600">
              {user.name}
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout} className="hover:glass-effect">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function AddCertificateForm({ onSubmit, onCancel }: {
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    studentName: '',
    degree: '',
    year: new Date().getFullYear().toString(),
    certCode: '',
    institutionName: '',
    institutionBlockchainId: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Student Name</label>
          <Input
            value={formData.studentName}
            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
            placeholder="John Smith"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Degree</label>
          <Input
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            placeholder="Bachelor of Science"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Year</label>
          <Input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            placeholder="2024"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Certificate Code</label>
          <Input
            value={formData.certCode}
            onChange={(e) => setFormData({ ...formData, certCode: e.target.value })}
            placeholder="CERT-2024-001"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Institution Name</label>
          <Input
            value={formData.institutionName}
            onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
            placeholder="University of Technology"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Institution Blockchain ID</label>
          <Input
            value={formData.institutionBlockchainId}
            onChange={(e) => setFormData({ ...formData, institutionBlockchainId: e.target.value })}
            placeholder="INST-123ABC"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          Add Certificate
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <Card className="border hover:border-blue-300 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{certificate.studentName}</h3>
            <p className="text-sm text-slate-600">{certificate.degree}</p>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-300">
            Verified
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Institution</p>
            <p className="font-medium">{certificate.institution.name}</p>
          </div>
          <div>
            <p className="text-slate-500">Year</p>
            <p className="font-medium">{certificate.year}</p>
          </div>
          <div>
            <p className="text-slate-500">Certificate Code</p>
            <p className="font-mono text-xs">{certificate.certCode}</p>
          </div>
          <div>
            <p className="text-slate-500">Blockchain TX</p>
            <p className="font-mono text-xs truncate">{certificate.blockchainTxHash || 'Pending'}</p>
          </div>
        </div>

        {certificate.blockchainTxHash && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-3 w-3" />
              <span>Blockchain anchored</span>
              <span className="text-blue-600 cursor-pointer hover:underline">
                View transaction
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
