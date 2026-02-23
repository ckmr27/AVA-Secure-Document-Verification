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
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, FileCheck, Link, Lock, Zap, Users, CheckCircle2,
  ArrowRight, Upload, Search, AlertTriangle, XCircle, Download,
  Plus, LogOut, Menu, X, Sparkles
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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        {currentView === 'login' && (
          <LoginForm onBack={() => setCurrentView('landing')} onLogin={handleLogin} loading={loading} error={error} />
        )}

        {currentView === 'verify' && (
          <VerifyPage onBack={() => {
            if (user) {
              setCurrentView(user.role === 'ADMIN' ? 'admin-dashboard' : 'user-dashboard')
            } else {
              setCurrentView('landing')
            }
          }} />
        )}

        {currentView === 'admin-dashboard' && user?.role === 'ADMIN' && (
          <AdminDashboard user={user} onLogout={handleLogout} />
        )}

        {currentView === 'user-dashboard' && user && (
          <UserDashboard user={user} onLogout={handleLogout} onVerify={() => setCurrentView('verify')} />
        )}

        {currentView === 'landing' && (
          <LandingPage onLogin={() => setCurrentView('login')} onVerify={() => setCurrentView('verify')} />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

function LandingPage({ onLogin, onVerify }: { onLogin: () => void; onVerify: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation onLogin={onLogin} onVerify={onVerify} />

      <main className="flex-1 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <HeroSection onVerify={onVerify} onLogin={onLogin} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <ProblemSection />
        </motion.div>

        <BenefitsSection />
        <HowItWorksSection />
        <TechnologySection />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <CTASection onVerify={onVerify} />
        </motion.div>
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AVA
            </span>
            <span className="text-sm text-slate-500 ml-2 hidden sm:block font-medium">
              Authenticity Validator for Academia
            </span>
          </motion.div>

          <div className="hidden sm:flex gap-3">
            <Button variant="ghost" onClick={onLogin} className="text-slate-600 hover:text-blue-600 font-bold uppercase tracking-widest text-xs transition-colors">
              Portal Access
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 rounded-xl shadow-lg shadow-blue-500/20 uppercase tracking-widest text-xs"
              >
                Live Demo
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
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

function HeroSection({ onVerify, onLogin }: { onVerify: () => void; onLogin: () => void }) {
  return (
    <section className="relative py-24 px-4 bg-slate-900 text-white overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-600/20"></div>
      </div>

      <div className="container mx-auto text-center max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-6 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1 text-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Enterprise-Grade Security
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight"
        >
          Secure Digital Verification of
          <span className="block mt-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Academic Credentials
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Combat academic document fraud with advanced OCR, cryptographic hashing,
          and blockchain-anchored verification. Trust in every certificate.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Button
            size="lg"
            onClick={onVerify}
            className="group bg-slate-800 hover:bg-slate-700 text-white border border-white/10 px-10 py-7 text-xl rounded-2xl transition-all duration-300"
          >
            <FileCheck className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
            Verify a Document
            <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              onClick={onLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-7 text-xl rounded-2xl transition-all duration-300 shadow-2xl shadow-blue-500/40 border-0 font-black flex items-center gap-3"
            >
              <Zap className="h-6 w-6 text-blue-200" />
              Launch Demo Login
              <Sparkles className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-10 hidden lg:block opacity-20"
      >
        <Shield className="h-20 w-20 text-blue-500" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-10 hidden lg:block opacity-20"
      >
        <Lock className="h-20 w-20 text-indigo-500" />
      </motion.div>
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
    <section className="py-24 px-4 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose AVA?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto opacity-90">
              Comprehensive security powered by cutting-edge technology for the modern institution
            </p>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, translateY: -5 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-xl"
            >
              <div className="bg-blue-500/20 rounded-xl p-3 w-fit mb-6 group-hover:bg-blue-500/30 transition-colors">
                <benefit.icon className="h-8 w-8 text-blue-300" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-blue-100/80 leading-relaxed text-lg">{benefit.desc}</p>
            </motion.div>
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
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              How It Works
            </h2>
            <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto opacity-80">
              Simple, secure, and transparent verification process for everyone
            </p>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-1 border-t-4 border-dashed border-blue-100"></div>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="text-center relative z-10"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`h-28 w-28 ${step.num === 3 ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-blue-100 text-blue-600'} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transition-colors duration-500`}
              >
                <span className="text-4xl font-black">{step.num}</span>
              </motion.div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">{step.title}</h3>
              <p className="text-lg text-slate-600 leading-relaxed">{step.desc}</p>
            </motion.div>
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
    <section className="py-24 px-4 bg-slate-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Technology Stack
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto opacity-80">
              Enterprise-grade security through multi-layered technology and decentralized infrastructure
            </p>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {techs.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-2 border-slate-100 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl h-full group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <tech.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    {tech.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tech.items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 text-lg leading-snug">{item}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection({ onVerify }: { onVerify: () => void }) {
  return (
    <section className="py-24 px-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto text-center max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Verify with Confidence?
          </h2>
          <p className="text-xl text-blue-100 mb-10 opacity-90 leading-relaxed">
            Join institutions worldwide in securing academic credentials.
            Start your free verification trial today.
          </p>
          <Button
            size="lg"
            onClick={onVerify}
            className="group bg-white text-blue-700 hover:bg-blue-50 px-12 py-8 text-2xl rounded-2xl shadow-2xl transition-all duration-300"
          >
            Verify Your First Document
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Button>
        </motion.div>
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
    <div className="min-h-screen flex flex-col bg-slate-900 relative overflow-hidden">
      {/* Dynamic background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-indigo-600/20 to-blue-600/20 rounded-full blur-[120px]"
        />
      </div>

      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl relative z-20">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-blue-500" />
            <span className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              AVA
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl px-5"
          >
            <ArrowRight className="mr-3 h-5 w-5 rotate-180" />
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="bg-slate-800/50 backdrop-blur-3xl border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden rounded-[32px]">
            <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500"></div>
            <CardHeader className="text-center pt-10 pb-6 px-10">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mx-auto bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              >
                <Lock className="h-8 w-8 text-blue-400" />
              </motion.div>
              <CardTitle className="text-4xl font-bold text-white mb-3">Sign In to AVA</CardTitle>
              <CardDescription className="text-slate-400 text-lg">
                Access your secure document vault. <br />
                <span className="text-blue-400 font-bold text-sm uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full mt-2 inline-block">
                  Any email works for demo access
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400 rounded-2xl">
                      <AlertTriangle className="h-5 w-5" />
                      <AlertDescription className="text-base ml-2">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-300 uppercase tracking-widest ml-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="admin@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900/50 border-white/10 border-2 text-white h-14 rounded-2xl px-5 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-300 uppercase tracking-widest ml-1">Secure Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-900/50 border-white/10 border-2 text-white h-14 rounded-2xl px-5 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-16 rounded-2xl text-xl font-bold shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : 'Sign In Now'}
                </Button>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <p className="text-center text-slate-500 text-sm font-medium uppercase tracking-tighter">Quick Access Demo Accounts</p>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => { setEmail('admin@university.edu'); setPassword('admin123') }}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 p-4 rounded-2xl text-sm font-mono flex items-center justify-between transition-colors border border-white/5 group"
                    >
                      <span>Admin Access</span>
                      <span className="text-blue-400 group-hover:underline">Fill Credentials</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmail('user@company.com'); setPassword('user123') }}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 p-4 rounded-2xl text-sm font-mono flex items-center justify-between transition-colors border border-white/5 group"
                    >
                      <span>Standard User</span>
                      <span className="text-blue-400 group-hover:underline">Fill Credentials</span>
                    </button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
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
      setResult(null)
      toast.info(`Selected file: ${e.dataTransfer.files[0].name}`)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
      toast.info(`Selected file: ${e.target.files[0].name}`)
    }
  }

  const handleVerify = async () => {
    if (!file) {
      toast.error('Please upload a certificate file to verify')
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
      if (data.status === 'verified') {
        toast.success(`Certificate verified for ${data.details.studentName}`)
      } else if (data.status === 'suspicious') {
        toast.warning('Certificate shows signs of tampering')
      } else {
        toast.error('Certificate not found in database')
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 center-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b_0%,transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      </div>

      <nav className="border-b border-white/5 bg-slate-950/50 backdrop-blur-xl relative z-20">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Shield className="h-10 w-10 text-cyan-400" />
            <span className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AVA
            </span>
          </motion.div>
          <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white rounded-xl">
            <ArrowRight className="mr-3 h-5 w-5 rotate-180" />
            Exit Verification
          </Button>
        </div>
      </nav>

      <div className="flex-1 container mx-auto px-6 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-extrabold mb-6 text-white tracking-tight">Verify Credential</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Securely validate academic certificates using our decentralized verification engine.
            </p>
          </motion.div>

          <Card className="bg-slate-900/50 backdrop-blur-3xl border-white/10 shadow-2xl rounded-[32px] overflow-hidden">
            <CardHeader className="pt-10 px-10">
              <CardTitle className="text-2xl text-white">Advanced Check</CardTitle>
              <CardDescription className="text-slate-400">Upload high-resolution scans or digital PDFs</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`border-4 border-dashed rounded-[24px] p-20 text-center transition-all cursor-pointer ${dragActive ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/10 hover:border-cyan-400/50'
                  } relative group`}
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
                <label htmlFor="file-input" className="cursor-pointer block">
                  <motion.div
                    animate={dragActive ? { scale: 1.2 } : { scale: 1 }}
                    className="h-24 w-24 bg-cyan-400/10 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-cyan-400/20 transition-colors"
                  >
                    <Upload className="h-12 w-12 text-cyan-400" />
                  </motion.div>
                  <h3 className="text-3xl font-bold mb-4 text-white">
                    {file ? file.name : 'Drop certificate here'}
                  </h3>
                  <p className="text-xl text-slate-400 mb-6">
                    {file ? 'Document analyzed and ready' : 'Drag and drop or browse from computer'}
                  </p>
                  <div className="flex justify-center gap-3">
                    <Badge variant="outline" className="text-slate-500 border-white/10">PDF</Badge>
                    <Badge variant="outline" className="text-slate-500 border-white/10">JPG</Badge>
                    <Badge variant="outline" className="text-slate-500 border-white/10">PNG</Badge>
                  </div>
                </label>
              </motion.div>

              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white h-20 text-2xl font-bold mt-10 rounded-2xl shadow-xl shadow-cyan-900/20 active:scale-[0.98] transition-all"
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-4">
                    <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-white" />
                    Analyzing Forensics...
                  </span>
                ) : (
                  <>
                    <Zap className="mr-3 h-7 w-7" />
                    Start Verification
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                <VerificationResultCard result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function VerificationResultCard({ result }: { result: VerificationResult }) {
  const isVerified = result.status === 'verified'
  const isSuspicious = result.status === 'suspicious'

  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="mt-12"
    >
      <Card className={`overflow-hidden border-2 rounded-[32px] shadow-2xl ${isVerified ? 'border-emerald-500/20 bg-emerald-500/5' :
        isSuspicious ? 'border-amber-500/20 bg-amber-500/5' :
          'border-rose-500/20 bg-rose-500/5'
        } backdrop-blur-3xl`}>
        <div className="p-10">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className={`h-24 w-24 rounded-3xl flex items-center justify-center ${isVerified ? 'bg-emerald-500' :
                isSuspicious ? 'bg-amber-500' :
                  'bg-rose-500'
                } shadow-lg shadow-black/20`}
            >
              {isVerified ? <CheckCircle2 className="h-12 w-12 text-white" /> :
                isSuspicious ? <AlertTriangle className="h-12 w-12 text-white" /> :
                  <XCircle className="h-12 w-12 text-white" />}
            </motion.div>
            <div className="text-center md:text-left">
              <h2 className={`text-4xl font-black mb-2 ${isVerified ? 'text-emerald-400' :
                isSuspicious ? 'text-amber-400' :
                  'text-rose-400'
                }`}>
                {isVerified ? 'Authenticity Confirmed' :
                  isSuspicious ? 'Potential Tampering' :
                    'Verification Error'}
              </h2>
              <p className="text-xl text-slate-400 font-medium">
                {result.message}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {result.details && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6 pt-8 border-t border-white/5"
              >
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <p className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">Subject Name</p>
                      <p className="text-2xl font-bold text-white tracking-tight">{result.details.studentName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">Credential Type</p>
                      <p className="text-2xl font-bold text-white tracking-tight">{result.details.degree}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">Registry Entity</p>
                      <p className="text-2xl font-bold text-white tracking-tight">{result.details.institution}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">Date Filter</p>
                      <p className="text-2xl font-bold text-white tracking-tight">{result.details.year}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-3">Blockchain TX Identifier</p>
                  <p className="font-mono text-cyan-400 text-sm break-all select-all">{result.details.certCode}</p>
                </div>

                {isVerified && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center pt-6"
                  >
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase">
                      Zero-Knowledge Proof Verified
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
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
        toast.success(`Successfully added certificate for ${formData.studentName}`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add certificate')
      }
    } catch (error) {
      console.error('Failed to add certificate:', error)
      toast.error('Failed to add certificate')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Dynamic background element */}
      <div className="absolute top-0 left-0 w-full h-64 bg-slate-900 z-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,#3b82f6,transparent_70%)]"></div>
      </div>

      <DashboardNav user={user} onLogout={onLogout} />

      <div className="flex-1 container mx-auto px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Admin Console</h1>
            <p className="text-slate-400 text-lg mt-1 font-medium italic">Secure Cryptographic Registry</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`h-14 px-8 rounded-2xl text-lg font-bold shadow-2xl transition-all duration-300 ${showAddForm
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-white text-slate-900 hover:bg-slate-100 shadow-white/10'
              }`}
          >
            {showAddForm ? <X className="mr-3 h-5 w-5" /> : <Plus className="mr-3 h-6 w-6" />}
            {showAddForm ? 'Close Editor' : 'Issue New Certificate'}
          </Button>
        </motion.div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="mb-12 overflow-hidden"
            >
              <Card className="bg-white border-0 shadow-2xl rounded-[32px] overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <CardHeader className="p-10">
                  <CardTitle className="text-3xl font-black text-slate-900">Certificate Metadata</CardTitle>
                  <CardDescription className="text-lg">Enter student credentials for blockchain anchoring</CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-12">
                  <AddCertificateForm onSubmit={handleAddCertificate} onCancel={() => setShowAddForm(false)} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="bg-white border-0 shadow-xl rounded-[40px] overflow-hidden">
          <CardHeader className="p-10 flex flex-row items-center justify-between border-b border-slate-50">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Registry Ledger</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Verified Certificate Repository</CardDescription>
            </div>
            <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-4 py-1.5 text-sm font-bold">
              {certificates.length} RECORDS
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-32">
                <div className="relative h-16 w-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
                </div>
                <p className="mt-6 text-slate-400 font-bold uppercase tracking-widest text-sm">Syncing Ledger...</p>
              </div>
            ) : certificates.length === 0 ? (
              <div className="py-32 text-center">
                <div className="bg-slate-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Certificates Issued</h3>
                <p className="text-slate-500 text-lg mb-8">Start the registry by issuing your first credential.</p>
                <Button onClick={() => setShowAddForm(true)} variant="outline" className="rounded-xl border-2">
                  Open Issue Interface
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[700px]">
                <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatePresence initial={false}>
                    {certificates.map((cert, index) => (
                      <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CertificateCard certificate={cert} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
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
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/[0.02] -skew-x-12 transform origin-top-right"></div>

      <DashboardNav user={user} onLogout={onLogout} />

      <div className="flex-1 container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100"
          >
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                Welcome back, {user.name.split(' ')[0]}
              </h1>
              <p className="text-xl text-slate-500 font-medium">
                Verify academic credentials with zero trust security.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-50 p-6 rounded-3xl text-center border border-blue-100">
                <p className="text-blue-600 font-bold text-3xl">12</p>
                <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mt-1">Total Checks</p>
              </div>
              <div className="bg-green-50 p-6 rounded-3xl text-center border border-green-100">
                <p className="text-green-600 font-bold text-3xl">100%</p>
                <p className="text-green-400 text-xs font-bold uppercase tracking-wider mt-1">Accuracy</p>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                icon: Upload,
                title: 'Upload & Verify',
                desc: 'Upload document scans for instant AI-powered validation.',
                color: 'blue',
                onClick: onVerify
              },
              {
                icon: Search,
                title: 'Lookup by Code',
                desc: 'Instantly verify any certificate using its unique identifier.',
                color: 'indigo'
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className="group overflow-hidden rounded-[32px] border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer relative h-full"
                  onClick={card.onClick}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${card.color}-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                  <CardContent className="p-10 relative z-10">
                    <div className={`h-20 w-20 bg-${card.color}-100 rounded-[28px] flex items-center justify-center mb-8 group-hover:bg-${card.color}-600 transition-colors duration-300`}>
                      <card.icon className={`h-10 w-10 text-${card.color}-600 group-hover:text-white transition-colors duration-300`} />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">{card.title}</h3>
                    <p className="text-lg text-slate-500 leading-relaxed mb-6">
                      {card.desc}
                    </p>
                    <div className={`flex items-center text-${card.color}-600 font-bold group-hover:translate-x-2 transition-transform`}>
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-[40px] border-0 shadow-lg overflow-hidden">
              <CardHeader className="p-10 border-b border-slate-50">
                <CardTitle className="text-2xl font-bold">Recent Verification History</CardTitle>
                <CardDescription>Real-time view of your latest document checks</CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-10"
                >
                  <div className="bg-slate-50 p-8 rounded-full mb-6">
                    <FileCheck className="h-12 w-12 text-slate-300" />
                  </div>
                  <p className="text-xl text-slate-500 font-medium">No documents verified yet today</p>
                  <Button variant="link" onClick={onVerify} className="text-blue-600 text-lg mt-2">
                    Start your first check
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function DashboardNav({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <nav className="border-b border-white/10 bg-slate-900/60 backdrop-blur-3xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Shield className="h-10 w-10 text-blue-500" />
            <span className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              AVA
            </span>
            <Badge variant="outline" className="ml-4 bg-white/5 border-white/10 text-slate-300 font-bold px-3 py-1 rounded-lg">
              {user.role === 'ADMIN' ? 'Control Plane' : 'User Terminal'}
            </Badge>
          </motion.div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-black text-white tracking-tight uppercase">
                {user.name}
              </span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-tight">
                Session Active
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="h-12 w-12 sm:w-auto sm:px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 group transition-all"
            >
              <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform sm:mr-3" />
              <span className="hidden sm:inline font-bold">Logout</span>
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {[
          { label: 'Student Name', key: 'studentName', placeholder: 'John Smith', type: 'text' },
          { label: 'Degree Name', key: 'degree', placeholder: 'Bachelor of Science', type: 'text' },
          { label: 'Graduation Year', key: 'year', placeholder: '2025', type: 'number' },
          { label: 'Unique Certificate Code', key: 'certCode', placeholder: 'CERT-2025-X82', type: 'text' },
          { label: 'Issuing Institution', key: 'institutionName', placeholder: 'University of Technology', type: 'text' },
          { label: 'Blockchain ID (Optional)', key: 'institutionBlockchainId', placeholder: 'REG-123-INST', type: 'text' },
        ].map((field) => (
          <div key={field.key} className="space-y-3">
            <label className="text-sm font-black text-slate-600 uppercase tracking-widest">{field.label}</label>
            <Input
              type={field.type}
              value={(formData as any)[field.key]}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg font-medium"
              required={field.key !== 'institutionBlockchainId'}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-100">
        <Button
          type="submit"
          className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
        >
          Anchor to Blockchain
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-16 px-10 border-2 rounded-2xl text-lg font-bold text-slate-600 hover:bg-slate-50 transition-all"
        >
          Discard Changes
        </Button>
      </div>
    </form>
  )
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -4 }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[32px] overflow-hidden group">
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-2">
              <h3 className="font-black text-2xl text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                {certificate.studentName}
              </h3>
              <p className="text-lg text-slate-500 font-medium">{certificate.degree}</p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-4 py-1.5 font-bold uppercase tracking-wider">
              Cryptographic Secure
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Institution</p>
              <p className="font-bold text-slate-700 text-base">{certificate.institution.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Class Of</p>
              <p className="font-bold text-slate-700 text-base">{certificate.year}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Registry Code</p>
              <p className="font-mono text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-blue-600 font-bold">
                {certificate.certCode}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Hash Fingerprint</p>
              <p className="font-mono text-xs truncate max-w-[120px] text-slate-500">
                {certificate.blockchainTxHash || 'Anchoring...'}
              </p>
            </div>
          </div>

          {certificate.blockchainTxHash && (
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Blockchain Anchored
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 font-bold hover:bg-blue-50 rounded-xl px-4"
                onClick={() => window.open(`https://etherscan.io/tx/${certificate.blockchainTxHash}`, '_blank')}
              >
                Explorer View
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
