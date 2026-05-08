import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { verifyPassword } from "./auth";
import { rateLimit } from "./rate-limiter";

// Build OAuth providers array - only add if credentials are present
const oauthProviders = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  oauthProviders.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  oauthProviders.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    ...oauthProviders,
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        const password = credentials.password;

        // Rate limiting for login attempts: 5 per 15 minutes
        const ip = (req as any).headers?.["x-forwarded-for"] || "unknown";
        const rlResult = await rateLimit(`login:${email}:${ip}`, 5, 15 * 60);

        if (!rlResult.success) {
          throw new Error("Too many login attempts. Please try again in 15 minutes.");
        }

        try {
          let user = await db.user.findUnique({
            where: { email },
          });

          if (!user) {
            // Only auto-create users in development mode
            if (process.env.NODE_ENV !== "production") {
              // Explicitly check for demo accounts
              const demoEmails = [
                process.env.OFFLINE_ADMIN_EMAIL || "admin@ava.com",
                process.env.OFFLINE_USER_EMAIL || "user@ava.com",
              ].filter(Boolean);

              if (demoEmails.includes(email)) {
                const { hashPassword } = await import("./auth");
                const hashedPassword = await hashPassword(password);

                user = await db.user.create({
                  data: {
                    email,
                    password: hashedPassword,
                    name: email.split("@")[0],
                    role: email === (process.env.OFFLINE_ADMIN_EMAIL || "admin@ava.com") 
                      ? "ADMIN" 
                      : "USER",
                  },
                });
                console.log(`Created demo user: ${email}`);
              } else {
                return null;
              }
            } else {
              // Production: Don't auto-create users
              return null;
            }
          } else {
            if (!user.password) {
              return null;
            }

            const isValid = await verifyPassword(password, user.password);
            if (!isValid) {
              return null;
            }
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Database connection failed, attempting offline fallback:", error);

          // Offline Fallback: Only use if explicitly configured
          // DO NOT have hardcoded defaults
          const offlineAdminEmail = process.env.OFFLINE_ADMIN_EMAIL;
          const offlineAdminPassword = process.env.OFFLINE_ADMIN_PASSWORD;
          const offlineUserEmail = process.env.OFFLINE_USER_EMAIL;
          const offlineUserPassword = process.env.OFFLINE_USER_PASSWORD;

          // Only proceed if all offline credentials are explicitly set
          if (
            offlineAdminEmail &&
            offlineAdminPassword &&
            offlineUserEmail &&
            offlineUserPassword
          ) {
            // Check admin credentials
            if (email === offlineAdminEmail && password === offlineAdminPassword) {
              console.log(`Offline login: ${email}`);
              return {
                id: "offline-admin",
                email: offlineAdminEmail,
                name: "Admin",
                role: "ADMIN",
              };
            }

            // Check user credentials
            if (email === offlineUserEmail && password === offlineUserPassword) {
              console.log(`Offline login: ${email}`);
              return {
                id: "offline-user",
                email: offlineUserEmail,
                name: "User",
                role: "USER",
              };
            }
          }

          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
