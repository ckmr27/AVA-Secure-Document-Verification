import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { generateSHA256, uploadToIPFS } from '@/lib/verification'
import {
  registerCertificateOnBlockchain,
  getBlockchainStatus,
} from '@/lib/blockchain.service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const blockchainStatus = await getBlockchainStatus()

    const certificates = await db.certificate.findMany({
      include: {
        institution: true,
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      certificates,
      blockchainType: blockchainStatus.type,
      blockchainConnected: blockchainStatus.connected,
    })
  } catch (error) {
    console.error('Get certificates error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      studentName,
      degree,
      year,
      certCode,
      institutionName,
      institutionBlockchainId,
      fileContent,
      fileName,
    } = body

    // Validate required fields
    if (!studentName || !degree || !year || !certCode || !institutionName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check blockchain status
    const blockchainStatus = await getBlockchainStatus()

    let fileHash: string
    let ipfsLink: string = `Qm${Math.random().toString(36).substring(2, 46)}` // Default placeholder

    // Handle real document if provided
    if (fileContent) {
      const fileBuffer = Buffer.from(fileContent.split(',')[1] || fileContent, 'base64')
      fileHash = await generateSHA256(fileBuffer)

      console.log('📦 Issuing with real document - Uploading to IPFS...')
      try {
        ipfsLink = await uploadToIPFS(fileBuffer, fileName || `${certCode}.pdf`)
      } catch (ipfsError) {
        console.error('IPFS Upload Error:', ipfsError)
        // Fallback or handle error
      }
    } else {
      // Generate hash from metadata if no file provided
      console.log('📄 Issuing via metadata hash...')
      fileHash = await generateSHA256(`${studentName}-${degree}-${year}-${certCode.toUpperCase()}`)
    }

    // Check if certificate code already exists
    const existingCert = await db.certificate.findUnique({
      where: { certCode: certCode.toUpperCase() },
    })

    if (existingCert) {
      return NextResponse.json(
        { error: 'Certificate code already exists' },
        { status: 409 }
      )
    }

    // Find or create institution
    let institution = await db.institution.findUnique({
      where: { name: institutionName },
    })

    if (!institution) {
      institution = await db.institution.create({
        data: {
          name: institutionName,
          blockchainId: institutionBlockchainId || `INST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        },
      })
    }

    // Prepare certificate data for blockchain
    const certData = {
      studentName,
      degree,
      year: parseInt(year),
      institution: institutionName,
      certCode: certCode.toUpperCase(),
      fileHash,
    }

    // Register on REAL blockchain
    const blockchainResult = await registerCertificateOnBlockchain(certData)

    if (!blockchainResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to register certificate on blockchain',
          details: blockchainResult.error,
          blockchainType: blockchainStatus.type,
        },
        { status: 500 }
      )
    }

    // Create certificate in database
    const certificate = await db.certificate.create({
      data: {
        studentName,
        degree,
        year: parseInt(year),
        certCode: certCode.toUpperCase(),
        title: `${studentName} - ${degree}`,
        fileHash,
        ipfsLink: ipfsLink,
        blockchainTxHash: blockchainResult.transactionHash || null,
        institutionId: institution.id,
        uploadedBy: parseInt((session.user as any).id) || 1,
      },
      include: {
        institution: true,
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      certificate,
      blockchainType: blockchainStatus.type,
      transactionHash: blockchainResult.transactionHash,
      blockNumber: blockchainStatus.details || 'N/A',
      message: `Certificate successfully registered on ${blockchainStatus.type} blockchain!`,
    })
  } catch (error) {
    console.error('Create certificate error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        blockchainType: process.env.BLOCKCHAIN_TYPE || 'SIMULATION',
      },
      { status: 500 }
    )
  }
}