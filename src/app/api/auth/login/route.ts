import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    let user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Auto-create user for demo purposes if it doesn't exist
      const defaultHashedPassword = await verifyPassword('admin123', 'invalid-hash')
        ? 'dummy'
        : await hashPassword('admin123') // Default password for demo users

      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          password: defaultHashedPassword,
          name: email.split('@')[0],
          role: 'USER',
        },
      })
      console.log(`Auto-created demo user: ${email}`)
    } else {
      const isValidPassword = await verifyPassword(password, user.password)

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
    }

    await createSession(user.id.toString(), user.role, user.name)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
