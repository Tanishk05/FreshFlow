# 🚨 Security Quick Fix Guide

## Immediate Actions (Do These First!)

### 1. Stop the Compromised Container

```bash
docker stop freshflow
docker rm freshflow
```

### 2. Fix Environment File Issue

The `cat ./.env*` errors indicate environment files aren't being loaded properly.

**On your server, create/verify `.env.production` file:**

```bash
# SSH into your server
cd /root/freshflow  # or wherever your project is

# Create .env.production if it doesn't exist
nano .env.production
```

**Required environment variables:**
```bash
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_auth_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret
GEMINI_API_KEY=your_gemini_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email
SENDGRID_API_KEY=your_sendgrid_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

### 3. Rebuild with Security Fixes

```bash
# Pull latest code with security fixes
git pull origin main

# Rebuild Docker image
docker build -t freshflow:secure .

# Run with proper environment file
docker run -d \
  --name freshflow \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file /root/freshflow/.env.production \
  freshflow:secure

# Check logs
docker logs -f freshflow
```

### 4. Verify Security Fixes Are Active

Check that the new security middleware is working:

```bash
# Test rate limiting
curl -I http://localhost:3000/api/profile

# Should see security headers in response:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

### 5. Check for Remaining Issues

```bash
# Monitor logs for any remaining errors
docker logs freshflow 2>&1 | grep -i "error\|warn\|cat\|wget\|curl"

# Should NOT see:
# - cat ./.env* errors
# - wget/curl commands
# - spawnSync errors
```

## What Was Fixed

### ✅ Security Middleware Added
- Blocks shell command patterns in inputs
- Rate limiting (100 req/min per IP)
- Security headers on all responses

### ✅ Input Sanitization
- All user inputs are sanitized
- Shell metacharacters blocked
- XSS patterns filtered

### ✅ JSON Parsing Security
- Added validation to prevent code injection
- Better error handling

### ✅ Environment Variable Handling
- No more shell commands to read .env files
- Proper Docker environment variable mounting

## If Issues Persist

1. **Check Docker Compose** (if using):
   ```bash
   # Ensure env_file is set correctly
   cat docker-compose.yml
   ```

2. **Verify Environment Variables**:
   ```bash
   docker exec freshflow env | grep -E "MONGODB|AUTH|NEXT"
   ```

3. **Check for Malicious Code**:
   ```bash
   # Search for suspicious patterns
   grep -r "wget\|curl\|exec\|spawn" src/
   grep -r "cat.*\.env" src/
   ```

4. **Review Dependencies**:
   ```bash
   npm audit
   npm audit fix
   ```

## Next Steps

1. Review the full [SECURITY_INCIDENT_RESPONSE.md](./SECURITY_INCIDENT_RESPONSE.md)
2. Set up monitoring for suspicious activity
3. Review access logs for the attack timeline
4. Update all secrets and API keys
5. Consider implementing additional security measures

## Emergency Rollback

If the new version has issues:

```bash
docker stop freshflow
docker rm freshflow
# Use previous working image tag
docker run -d --name freshflow -p 3000:3000 --env-file .env.production freshflow:previous-tag
```

---

**⚠️ CRITICAL:** Do not restart the compromised container. Always rebuild with security fixes first.

