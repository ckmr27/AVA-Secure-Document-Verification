import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { verifyPassword } from "./auth";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email.toLowerCase();
                const password = credentials.password;

                try {
                    let user = await db.user.findUnique({
                        where: { email },
                    });

                    if (!user) {
                        // Replicate legacy behavior: Auto-create user for demo purposes
                        const { hashPassword } = await import("./auth");
                        const hashedPassword = await hashPassword(password);

                        user = await db.user.create({
                            data: {
                                email,
                                password: hashedPassword,
                                name: email.split("@")[0],
                                role: "USER",
                            },
                        });
                        console.log(`Auto-created demo user via NextAuth: ${email}`);
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
                    console.error("Database connection failed, checking offline credentials:", error);

                    // Offline Fallback Credentials
                    const OFFLINE_USERS = [
                        {
                            email: "admin@ava.com",
                            password: "admin123",
                            name: "Demo Admin",
                            role: "ADMIN"
                        },
                        {
                            email: "user@ava.com",
                            password: "user123",
                            name: "Demo User",
                            role: "USER"
                        }
                    ];

                    const offlineUser = OFFLINE_USERS.find(
                        u => u.email === email && u.password === password
                    );

                    if (offlineUser) {
                        console.log(`Logged in via offline fallback: ${email}`);
                        return {
                            id: `offline-${offlineUser.role.toLowerCase()}`,
                            email: offlineUser.email,
                            name: offlineUser.name,
                            role: offlineUser.role,
                        };
                    }

                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token, user }) {
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
