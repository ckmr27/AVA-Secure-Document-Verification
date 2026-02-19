# Deployment Guide for AVA

This guide covers common deployment issues and solutions for the Authenticity Validator for Academia platform.

## 🚨 Common Deployment Issues

### 1. Database Connection Error

**Symptom:** Application shows "Internal server error" or database-related errors

**Cause:** The `DATABASE_URL` environment variable is pointing to a local file path that doesn't exist in production.

**Solution:**

1. **Option A: Use SQLite (Simple)**
   ```env
   DATABASE_URL=file:./db/custom.db
   ```
   - Make sure the `db/` directory exists and is writable
   - Run the seed script to populate initial data:
     ```bash
     bun run prisma/seed.ts
     ```

2. **Option B: Use PostgreSQL/MySQL (Recommended for Production)**
   - Set up a cloud database (Supabase, Neon, AWS RDS, etc.)
   - Update your environment variable:
     ```env
     DATABASE_URL=postgresql://user:password@host:port/database
     ```
   - Update Prisma schema provider:
     ```prisma
     datasource db {
       provider = "postgresql"  # or "mysql"
       url      = env("DATABASE_URL")
     }
     ```
   - Run migrations:
     ```bash
     bun run prisma migrate dev --name init
     bun run prisma/seed.ts
     ```

### 2. Cookie/Session Issues

**Symptom:** Login doesn't persist or shows authentication errors

**Cause:** Cookie settings may not be compatible with your production domain.

**Solution:** Ensure your hosting platform supports:
- HTTP-only cookies
- Secure cookies (HTTPS)
- Same-site cookie policy

If using a custom domain, update cookie settings in `src/lib/auth.ts`:
```typescript
cookieStore.set('session', JSON.stringify({ userId, userRole, userName }), {
  httpOnly: true,
  secure: true,  // Must be true for HTTPS
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  domain: '.yourdomain.com',  // Add for custom domains
})
```

### 3. API Route Errors

**Symptom:** API endpoints return 500 errors

**Cause:** Missing environment variables or database connection issues

**Solution:** Check server logs for detailed error messages:
```bash
# Check what error is being logged
# Look for: "Internal server error", "message: <actual error>"
```

Common fixes:
- Ensure `DATABASE_URL` is set correctly
- Run database migrations
- Seed the database with initial data
- Check file permissions

### 4. Build Failures

**Symptom:** Build command fails with errors

**Solution:**
```bash
# Clean build cache
rm -rf .next

# Rebuild
bun run build

# Check for errors in output
```

## 📋 Pre-Deployment Checklist

- [ ] Update `DATABASE_URL` for production database
- [ ] Set `NODE_ENV=production`
- [ ] Run database migrations: `bun run prisma migrate dev`
- [ ] Seed database: `bun run prisma/seed.ts`
- [ ] Test build locally: `bun run build`
- [ ] Verify environment variables are set on hosting platform
- [ ] Check database file permissions (if using SQLite)

## 🔧 Platform-Specific Deployment

### Vercel
1. Push code to Vercel
2. In project settings, add environment variable:
   - `DATABASE_URL` = Your connection string
   - `NODE_ENV` = `production`
3. Deploy
4. Note: Vercel deployments are read-only, use PostgreSQL instead of SQLite

### Netlify
1. Connect repository
2. Add environment variables in Site settings
3. Build settings:
   - Build command: `bun run build`
   - Publish directory: `.next`
4. Use PostgreSQL or MySQL (SQLite won't work well on serverless)

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .
RUN bun run build
RUN bun run prisma/seed.ts

EXPOSE 3000
CMD ["bun", "run", "start"]
```

```bash
docker build -t ava .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e NODE_ENV=production \
  ava
```

### VPS/Server
```bash
# Clone repo
git clone <your-repo>
cd ava

# Install dependencies
bun install

# Set environment
export DATABASE_URL="postgresql://..."
export NODE_ENV="production"

# Build
bun run build

# Seed database
bun run prisma/seed.ts

# Start (using PM2 for production)
pm2 start bun --name ava -- run start
```

## 🐛 Troubleshooting

### Application loads but can't login
1. Check if database is seeded
2. Verify user credentials exist in database
3. Check browser console for JavaScript errors
4. Check server logs for API errors

### Verification doesn't work
1. Check if certificates exist in database
2. Verify API endpoint is accessible
3. Check database connection in verification route
4. Look at server logs for detailed errors

### Blank pages or loading errors
1. Clear browser cache
2. Check build output for compilation errors
3. Verify all dependencies are installed
4. Check network connectivity

## 📞 Support

If issues persist:
1. Check server logs for specific error messages
2. Verify all environment variables are set
3. Test API endpoints directly:
   ```bash
   curl http://your-domain.com/api/auth/me
   ```
4. Check database connectivity

## 🔒 Security Notes

- Change default passwords before production deployment
- Use HTTPS in production
- Keep environment variables secure
- Rotate database credentials regularly
- Implement rate limiting on API routes
- Add input validation and sanitization

---

**Last Updated:** 2025
