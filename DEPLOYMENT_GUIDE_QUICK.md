# Quick Deployment Guide - FreshFlow

## 🚀 Deploy to Production in 10 Minutes

### Option A: Deploy to Vercel (Recommended - Fastest)

**1. Install Vercel CLI**
```bash
npm i -g vercel
```

**2. Login to Vercel**
```bash
vercel login
```

**3. Deploy**
```bash
# First deployment (will ask for project configuration)
vercel

# Production deployment
vercel --prod
```

**4. Set Environment Variables**
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:
```
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM="FreshFlow <noreply@yourdomain.com>"
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**5. Trigger Redeployment**
```bash
vercel --prod
```

**6. Setup Database Indexes**
```bash
curl https://your-domain.vercel.app/api/setup-indexes
```

**Done! Your app is live.** ✅

---

### Option B: Deploy via GitHub (Automatic Deployments)

**1. Push Code to GitHub**
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

**2. Import to Vercel**
- Go to https://vercel.com/new
- Click "Import Project"
- Select your GitHub repository
- Configure environment variables (same as above)
- Click "Deploy"

**3. Auto Deployments**
- Every push to `main` branch = production deployment
- Every push to other branches = preview deployment

---

### Option C: Deploy to DigitalOcean App Platform

**1. Create Account**
- Sign up at https://cloud.digitalocean.com

**2. Create App**
- Click "Create" → "Apps"
- Connect GitHub repository
- Choose branch: `main`

**3. Configure Build**
```
Build Command: npm run build
Run Command: npm start
Output Directory: .next
```

**4. Add Environment Variables**
(Same variables as Vercel option)

**5. Deploy**
- Click "Create Resources"
- Wait 5-10 minutes

---

### Option D: Self-Hosted with Docker

**1. Create Dockerfile**
```dockerfile
# Already exists in your project
```

**2. Build Image**
```bash
docker build -t freshflow .
```

**3. Run Container**
```bash
docker run -p 3000:3000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e NEXTAUTH_SECRET="your-secret" \
  freshflow
```

**4. Use Docker Compose**
```bash
docker-compose up -d
```

---

## 📋 Pre-Deployment Checklist

Run this automated check:
```bash
./pre-production-check.sh
```

Or manual checklist:
- [ ] All tests passing
- [ ] Production build successful (`npm run build`)
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] MongoDB Atlas cluster ready
- [ ] Email service tested
- [ ] Domain/SSL configured
- [ ] Analytics setup (optional)

---

## 🔑 Generate Production Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate WEBHOOK_SECRET
openssl rand -hex 32
```

---

## 🗄️ MongoDB Atlas Setup

**1. Create Cluster**
- Go to https://cloud.mongodb.com
- Click "Build a Database"
- Choose FREE M0 cluster
- Select region closest to your users
- Click "Create Cluster"

**2. Create Database User**
- Security → Database Access
- Add New Database User
- Choose password authentication
- Save username and password

**3. Configure Network Access**
- Security → Network Access
- Add IP Address
- Allow access from anywhere: `0.0.0.0/0` (for serverless)
- Or add Vercel IPs for security

**4. Get Connection String**
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy connection string
- Replace `<password>` with your user password
- Replace `<dbname>` with `freshflow`

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/freshflow?retryWrites=true&w=majority
```

---

## 📧 Email Service Setup

### Gmail (Quick Setup)
1. Enable 2FA on Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Create app password for "Mail"
4. Use in EMAIL_PASS

### SendGrid (Professional)
1. Sign up at https://sendgrid.com
2. Create API key
3. Update .env:
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### AWS SES (Scalable)
1. Sign up for AWS
2. Verify email domain in SES
3. Get SMTP credentials
4. Update .env with SMTP details

---

## 🌐 Custom Domain Setup

### Vercel
1. Go to Project → Settings → Domains
2. Add your domain: `yourdomain.com`
3. Follow DNS configuration instructions
4. SSL auto-configured ✓

### Cloudflare (Free SSL + CDN)
1. Add site to Cloudflare
2. Update nameservers at domain registrar
3. Configure DNS:
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy: Enabled (orange cloud)
```

---

## 📊 Post-Deployment Setup

**1. Setup Database Indexes**
```bash
curl https://yourdomain.com/api/setup-indexes
```

**2. Test Email System**
- Create test order
- Verify farmer receives email
- Check spam folder if needed

**3. Test Webhooks**
- Place order as retailer
- Approve as farmer
- Accept as distributor
- Verify all notifications work

**4. Setup Monitoring**
- Vercel Analytics (automatic)
- Google Analytics (add tracking code)
- Sentry for errors (optional)

**5. Test All User Flows**
- [ ] User registration
- [ ] Login/logout
- [ ] Farmer: Create produce
- [ ] Retailer: Place order
- [ ] Farmer: Approve order
- [ ] Distributor: Accept job
- [ ] Order completion flow

---

## 🐛 Common Issues & Solutions

**Build fails on Vercel:**
```bash
# Check Node version
# Vercel uses Node 18 by default
# Add to package.json:
"engines": {
  "node": ">=18.0.0"
}
```

**Database connection fails:**
- Check MongoDB Atlas network access allows Vercel
- Verify connection string has correct password
- Ensure database name is correct

**Emails not sending:**
- Check EMAIL_* variables are set
- Verify Gmail App Password (not regular password)
- Check spam folder for test emails
- Review server logs for errors

**404 errors:**
- Clear build cache: `vercel --force`
- Check NEXTAUTH_URL matches your domain
- Verify all routes in app directory

---

## 📈 Scaling Considerations

**When you grow:**
- [ ] Upgrade MongoDB Atlas tier (M2/M5)
- [ ] Add database read replicas
- [ ] Implement Redis caching
- [ ] Use CDN for static assets
- [ ] Enable Vercel Edge Functions
- [ ] Set up load balancing

---

## 🔒 Security Hardening

**Before launch:**
```bash
# Audit dependencies
npm audit fix

# Update packages
npm update

# Check for leaked secrets
git log --all --full-history --pretty=format: --name-only | grep -i "env"
```

---

## 📞 Support Resources

- **Vercel Support**: https://vercel.com/support
- **MongoDB Atlas Support**: https://support.mongodb.com
- **Next.js Documentation**: https://nextjs.org/docs
- **Next-Auth Documentation**: https://next-auth.js.org

---

## 🎉 Launch Checklist

**Final steps before going live:**
- [ ] Run `./pre-production-check.sh`
- [ ] All environment variables set
- [ ] Database indexes created
- [ ] Email service tested
- [ ] Domain configured with SSL
- [ ] Test user flows end-to-end
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Team notified of launch

**Deploy command:**
```bash
vercel --prod
```

**Rollback command (if needed):**
```bash
vercel rollback
```

---

**Questions?** Check PRODUCTION_CHECKLIST.md for detailed information.

**Ready to deploy!** 🚀
