import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      companyId: string
      divisionId: string | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    companyId: string
    divisionId: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    companyId: string
    divisionId: string | null
  }
}