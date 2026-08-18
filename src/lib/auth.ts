import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const email = credentials.email.trim().toLowerCase()

          const user = await db.user.findUnique({
            where: { email },
            include: { company: true },
          })

          if (!user) {
            console.log(`[AUTH] User not found: ${email}`)
            return null
          }

          if (!user.isActive) {
            console.log(`[AUTH] User account is inactive: ${email}`)
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValid) {
            console.log(`[AUTH] Invalid password attempt for user: ${email}`)
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
          }
        } catch (error) {
          console.error('[AUTH ERROR] Exception during authorize:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
      }
      return session
    },
  },
}