import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { verifyPassword } from "./auth";
import { rateLimit } from "./rate-limiter";

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
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email.toLowerCase();
                const password = credentials.password;

                // Rate limiting for login attempts: 5 per 15 minutes
                // Use key format "login:email:ip" to be specific
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
                        // Replicate legacy behavior: Auto-create user for demo purposes
                        const { hashPassword } = await import("./auth");
                        const hashedPassword = await hashPassword(password);

                        user = await db.user.create({
                            data: {
                                email,
                                password: hashedPassword,
                                name: email.split("@")[0],
                                role: (email === "admin@ava.com" || email === "admin@university.edu") ? "ADMIN" : "USER",
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

                        // Ensure demo admin stays admin
                        if ((email === "admin@ava.com" || email === "admin@university.edu") && user.role !== "ADMIN") {
                            user = await db.user.update({
                                where: { email },
                                data: { role: "ADMIN" }
                            });
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

                    // Offline Fallback Credentials (moved to Environment Variables)
                    const OFFLINE_USERS = [
                        {
                            email: process.env.OFFLINE_ADMIN_EMAIL || "admin@ava.com",
                            password: process.env.OFFLINE_ADMIN_PASSWORD || "admin123",
                            name: "Demo Admin",
                            role: "ADMIN"
                        },
                        {
                            email: process.env.OFFLINE_USER_EMAIL || "user@ava.com",
                            password: process.env.OFFLINE_USER_PASSWORD || "user123",
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
                if (user.email === "admin@ava.com" || user.email === "admin@university.edu") {
                    token.role = "ADMIN";
                }
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
