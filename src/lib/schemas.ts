import { z } from "zod";

/**
 * Shared Zod schemas for input validation and sanitization.
 */

// Certificate Verification Schema
export const VerifySchema = z.object({
  certCode: z
    .string()
    .trim()
    .max(50)
    .regex(/^CERT-\d{4}-[A-Z0-9]+$/i, "Invalid certificate code format")
    .optional()
    .or(z.literal("")),
  fileContent: z
    .string()
    .refine((val) => {
      // Check if base64 size is reasonable (e.g., max 10MB approx)
      // 10MB in base64 is ~13.7M characters
      return val.length < 15 * 1024 * 1024;
    }, "File size exceeds 10MB limit")
    .optional()
    .or(z.literal("")),
  fileName: z
    .string()
    .trim()
    .max(100)
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid characters in filename")
    .optional(),
}).refine(data => data.certCode || data.fileContent, {
  message: "Either certificate code or file content must be provided",
});

// Certificate Issuance Schema (Admin)
export const IssueSchema = z.object({
  studentName: z.string().trim().min(3).max(100),
  degree: z.string().trim().min(2).max(100),
  year: z.union([
    z.number().int().min(1900).max(2100),
    z.string().regex(/^\d{4}$/).transform(Number)
  ]),
  certCode: z.string().trim().max(50).regex(/^CERT-\d{4}-[A-Z0-9]+$/i),
  institutionName: z.string().trim().min(2).max(100),
  institutionBlockchainId: z.string().trim().max(50).optional(),
  fileContent: z.string().optional(),
  fileName: z.string().trim().max(100).optional(),
});

// User Registration/Update Schema
export const UserSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128).optional(),
});
