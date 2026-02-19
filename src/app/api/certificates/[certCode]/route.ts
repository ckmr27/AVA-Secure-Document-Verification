import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certCode: string }> }
) {
  try {
    const { certCode } = await params

    const certificate = await db.certificate.findUnique({
      where: { certCode: certCode.toUpperCase() },
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

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ certificate })
  } catch (error) {
    console.error('Get certificate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
