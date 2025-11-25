# Production Deployment Checklist for FreshFlow

## ✅ Critical Pre-Production Checks

### 1. Environment Variables & Configuration

**Required Actions:**

- [ ] Create production `.env` file with all required variables
- [ ] **NEVER** commit `.env.local` or production secrets to Git
- [ ] Set up environment variables in your hosting platform (Vercel/AWS/etc.)
- [ ] Use strong, unique secrets for production

**Required Environment Variables:**

```env
# MongoDB - Production Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/freshflow?retryWrites=true&w=majority

# NextAuth - Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# Email Service (Production SMTP)
EMAIL_HOST=smtp.gmail.com  # or your email provider
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-production-email@domain.com
EMAIL_PASS=your-production-app-password
EMAIL_FROM="FreshFlow <noreply@yourdomain.com>"

# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional: Webhook Configuration
WEBHOOK_SECRET=<generate-with: openssl rand -hex 32>
WEBHOOK_ENABLED=true
```

**Check Commands:**

```bash
# Generate secure secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -hex 32     # For WEBHOOK_SECRET

# Verify no secrets in git
git secrets --scan
grep -r "MONGODB_URI" . --exclude-dir=node_modules
```

---

### 2. Database & Data

**MongoDB Production Setup:**

- [ ] Create production MongoDB cluster (MongoDB Atlas recommended)
- [ ] Set up database indexes for performance
- [ ] Enable database backups (automated daily backups)
- [ ] Configure IP whitelist (allow hosting provider IPs)
- [ ] Set up read replicas for high availability (optional)

**Run Index Setup:**

```bash
# Make sure your production database has indexes
curl https://yourdomain.com/api/setup-indexes
```

**Database Indexes to Verify:**

- `users`: email (unique), role
- `orders`: farmerId, retailerId, distributorId, status, createdAt
- `produce`: userId, status, createdAt
- `notifications`: userId, read, createdAt
- `fleet`: distributorId, status
- `warehouseInventory`: distributorId

**Data Migration:**

- [ ] Export test data if needed: `mongodump`
- [ ] Import to production: `mongorestore`
- [ ] Verify data integrity after migration

---

### 3. Security Hardening

**Critical Security Checks:**

**a) Authentication:**

- [ ] NEXTAUTH_SECRET is unique and strong (32+ characters)
- [ ] OAuth callbacks use HTTPS URLs
- [ ] Session tokens use secure cookies (httpOnly, secure, sameSite)
- [ ] Password policies enforced (if using credentials)

**b) API Security:**

- [ ] All API routes have authentication checks
- [ ] Input validation on all user inputs
- [ ] Rate limiting implemented (consider Vercel Rate Limiting or Upstash)
- [ ] CORS properly configured
- [ ] XSS protection enabled

**c) Data Protection:**

- [ ] User passwords properly hashed (bcrypt)
- [ ] Sensitive data encrypted at rest
- [ ] MongoDB connection uses TLS/SSL
- [ ] No sensitive data in logs

**d) Headers & CSP:**

- [ ] Security headers configured in `next.config.ts`
- [ ] Content Security Policy (CSP) defined
- [ ] HSTS enabled for HTTPS
- [ ] X-Frame-Options set

**Security Headers to Add:**

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};
```

---

### 4. Performance Optimization

**Build Optimization:**

- [ ] Run production build: `npm run build`
- [ ] Check bundle size: `npm run build -- --analyze`
- [ ] Optimize images (use Next.js Image component)
- [ ] Enable gzip/brotli compression
- [ ] Minify CSS and JavaScript (automatic in Next.js)

**Code Splitting:**

- [ ] Dynamic imports for heavy components
- [ ] Lazy load dashboard components
- [ ] Route-based code splitting (automatic)

**Database Performance:**

- [ ] All indexes created and verified
- [ ] Queries optimized (avoid N+1 queries)
- [ ] Connection pooling configured
- [ ] Query results cached where appropriate

**CDN & Caching:**

- [ ] Static assets served from CDN
- [ ] Set proper cache headers
- [ ] Enable image optimization
- [ ] Configure ISR (Incremental Static Regeneration) for dashboards

**Performance Checks:**

```bash
# Build and analyze
npm run build
npm run start  # Test production mode locally

# Check bundle size
du -sh .next/static/

# Test performance
npx lighthouse https://yourdomain.com --view
```

---

### 5. Error Handling & Monitoring

**Error Tracking:**

- [ ] Set up error monitoring (Sentry, LogRocket, or similar)
- [ ] Configure error boundaries in React components
- [ ] Log all server errors with context
- [ ] Set up alerts for critical errors

**Logging:**

- [ ] Implement structured logging
- [ ] Log webhook events and failures
- [ ] Log authentication events
- [ ] Monitor API response times
- [ ] Track database query performance

**Recommended Services:**

- **Sentry** - Error tracking and performance monitoring
- **Vercel Analytics** - Web vitals and performance
- **MongoDB Atlas Monitoring** - Database performance
- **Upstash Redis** - Rate limiting and caching

**Setup Sentry (Recommended):**

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

### 6. Email Service Production

**Email Provider Setup:**

- [ ] Use production email service (SendGrid, AWS SES, Mailgun)
- [ ] Verify domain for email sending
- [ ] Set up SPF, DKIM, DMARC records
- [ ] Test email deliverability
- [ ] Set up email bounce handling
- [ ] Configure email rate limits

**Recommended Providers:**

- **SendGrid**: 100 emails/day free, easy setup
- **AWS SES**: $0.10 per 1000 emails, high deliverability
- **Mailgun**: Good for transactional emails

**Email Domain Verification:**

```bash
# Check DNS records
dig TXT yourdomain.com
dig TXT _dmarc.yourdomain.com
```

---

### 7. Testing

**Pre-Production Testing:**

- [ ] Run all tests: `npm test` (if tests exist)
- [ ] Manual testing of all user flows:
  - [ ] User registration and login
  - [ ] Farmer: Create produce, manage orders
  - [ ] Retailer: Browse marketplace, place orders
  - [ ] Distributor: Accept jobs, manage deliveries
  - [ ] Order lifecycle: Created → Approved → Assigned → Delivered
  - [ ] Webhooks: Verify emails and notifications
  - [ ] Payment flow (if implemented)

**Load Testing:**

- [ ] Test with multiple concurrent users
- [ ] Simulate high traffic scenarios
- [ ] Test database under load
- [ ] Monitor memory leaks

**Browser Testing:**

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

**Accessibility Testing:**

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] WCAG 2.1 AA compliance
- [ ] Color contrast ratios

---

### 8. Deployment Configuration

**Vercel Deployment (Recommended):**

**Install Vercel CLI:**

```bash
npm i -g vercel
```

**Deploy:**

```bash
# Production deployment
vercel --prod

# Or connect GitHub repo for automatic deployments
# Go to vercel.com → Import Project → Connect GitHub
```

**Vercel Configuration:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"] // Choose region closest to users
}
```

**Environment Variables in Vercel:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all production environment variables
3. Set appropriate environments (Production, Preview, Development)

**Other Hosting Options:**

- **AWS Amplify**: Good for AWS ecosystem
- **Netlify**: Similar to Vercel
- **Railway**: Easy Node.js deployment
- **DigitalOcean App Platform**: Full control
- **Self-hosted**: Docker + Nginx + PM2

---

### 9. Domain & SSL

**Domain Setup:**

- [ ] Purchase domain from registrar (Namecheap, GoDaddy, Cloudflare)
- [ ] Configure DNS records to point to hosting
- [ ] Set up SSL certificate (automatic with Vercel/Netlify)
- [ ] Verify HTTPS works correctly
- [ ] Redirect HTTP to HTTPS
- [ ] Set up www redirect (www to non-www or vice versa)

**DNS Records:**

```
Type    Name    Value                   TTL
A       @       76.76.21.21            3600
CNAME   www     cname.vercel-dns.com   3600
TXT     @       v=spf1 include:_spf.google.com ~all
```

---

### 10. Legal & Compliance

**Required Pages:**

- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] Refund/Return Policy (if applicable)
- [ ] Contact Information

**GDPR Compliance (if EU users):**

- [ ] Cookie consent banner
- [ ] Data export functionality
- [ ] Account deletion option
- [ ] Privacy controls

**Data Protection:**

- [ ] User data handling documented
- [ ] Data retention policy defined
- [ ] Backup and recovery procedures
- [ ] Security incident response plan

---

### 11. Documentation

**User Documentation:**

- [ ] User guides for each role (Farmer, Retailer, Distributor)
- [ ] FAQ page
- [ ] Video tutorials (optional)
- [ ] Help center or knowledge base

**Technical Documentation:**

- [ ] API documentation
- [ ] Webhook integration guide (✅ Done - WEBHOOK_SYSTEM.md)
- [ ] Deployment guide
- [ ] Troubleshooting guide

**Admin Documentation:**

- [ ] Admin panel usage guide
- [ ] User management procedures
- [ ] Database backup/restore procedures
- [ ] Monitoring and alerts setup

---

### 12. Backup & Disaster Recovery

**Backup Strategy:**

- [ ] Automated daily database backups (MongoDB Atlas)
- [ ] Store backups in multiple locations
- [ ] Test backup restoration monthly
- [ ] Document recovery procedures

**Disaster Recovery Plan:**

- [ ] Rollback procedure documented
- [ ] Emergency contact list
- [ ] Service restoration SLAs
- [ ] Communication plan for outages

---

### 13. Monitoring & Analytics

**Application Monitoring:**

- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Error tracking (Sentry)
- [ ] API endpoint monitoring

**Business Analytics:**

- [ ] Google Analytics or Plausible
- [ ] User behavior tracking
- [ ] Conversion funnels
- [ ] Order completion rates

**Dashboard Metrics:**

- [ ] Active users (DAU/MAU)
- [ ] Order volume
- [ ] Revenue tracking
- [ ] System performance metrics

---

### 14. SEO Optimization

**Technical SEO:**

- [ ] Add `robots.txt` file
- [ ] Create `sitemap.xml`
- [ ] Set up Google Search Console
- [ ] Meta tags on all pages
- [ ] Open Graph tags for social sharing
- [ ] Structured data (JSON-LD)

**robots.txt:**

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Sitemap: https://yourdomain.com/sitemap.xml
```

---

### 15. Final Pre-Launch Checks

**24 Hours Before Launch:**

- [ ] All environment variables verified in production
- [ ] Database backups enabled and tested
- [ ] SSL certificate valid and auto-renewal enabled
- [ ] Email service tested and working
- [ ] Monitoring and alerts configured
- [ ] Error tracking operational
- [ ] Load testing completed successfully

**Launch Day:**

- [ ] Monitor error logs closely
- [ ] Watch server metrics (CPU, memory, disk)
- [ ] Monitor database performance
- [ ] Track user registrations and orders
- [ ] Be ready for rapid rollback if needed

**Post-Launch (First Week):**

- [ ] Daily monitoring of errors and performance
- [ ] Collect user feedback
- [ ] Address critical bugs immediately
- [ ] Monitor email deliverability
- [ ] Track webhook success rates

---

## Quick Command Checklist

```bash
# 1. Generate production secrets
openssl rand -base64 32  # NEXTAUTH_SECRET
openssl rand -hex 32     # WEBHOOK_SECRET

# 2. Build and test production mode
npm run build
npm run start

# 3. Check for security issues
npm audit
npm audit fix

# 4. Update dependencies
npm update
npm outdated

# 5. Check bundle size
npm run build -- --analyze

# 6. Test production database connection
# Add test script in package.json

# 7. Deploy to production
vercel --prod

# 8. Setup indexes
curl https://yourdomain.com/api/setup-indexes

# 9. Test webhooks
# Place test order and verify emails

# 10. Monitor logs
vercel logs --follow
```

---

## Production Environment Variables Template

Create this as `.env.production.template` (check into Git):

```env
# Database
MONGODB_URI=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email Service
EMAIL_HOST=
EMAIL_PORT=
EMAIL_SECURE=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

# Application
NEXT_PUBLIC_APP_URL=

# Webhooks
WEBHOOK_SECRET=
WEBHOOK_ENABLED=

# Monitoring (optional)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Recommended Hosting Configuration

### Vercel (Recommended)

- **Pros**: Automatic deployments, great Next.js support, free SSL
- **Cons**: Serverless limits (10s execution time)
- **Cost**: Free for small apps, $20/month Pro

### AWS Amplify

- **Pros**: Full AWS integration, good scaling
- **Cons**: Steeper learning curve
- **Cost**: Pay as you go

### DigitalOcean App Platform

- **Pros**: Simple, predictable pricing
- **Cons**: Less Next.js optimization
- **Cost**: $5-12/month

---

## Critical Issues to Fix Before Production

Run this check:

```bash
# Check for console.log statements (remove in production)
grep -r "console.log" src/ --exclude-dir=node_modules

# Check for TODO comments
grep -r "TODO\|FIXME" src/ --exclude-dir=node_modules

# Check for hardcoded secrets
grep -r "mongodb://\|smtp://" src/ --exclude-dir=node_modules
```

---

## Support & Maintenance Plan

**Post-Launch Support:**

- Daily monitoring for first week
- Weekly review of analytics and errors
- Monthly security updates
- Quarterly feature updates

**Emergency Contacts:**

- Technical lead: [Your contact]
- Hosting provider support
- Database provider support
- Email service provider support

---

## Success Metrics

Track these KPIs:

- [ ] Uptime > 99.9%
- [ ] Page load time < 3 seconds
- [ ] Error rate < 0.1%
- [ ] Email delivery rate > 95%
- [ ] User registration conversion > 10%
- [ ] Order completion rate > 80%

---

**Good luck with your production launch! 🚀**
