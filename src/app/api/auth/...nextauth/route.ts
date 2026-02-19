import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        return {
          id: "1",
          email: credentials.email,
          role: credentials.email.includes("admin") ? "admin" : "user"
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.role = token.role as string;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    }
  }
});

export { handler as GET, handler as POST };
