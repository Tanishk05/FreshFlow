# NPM Audit Status

## Current Status

✅ No peer dependency warnings
✅ All packages installed successfully

## Known Issues

### Low Severity (3 vulnerabilities)

- **Package:** nodemailer <=7.0.10
- **Issue:** Address parser DoS vulnerability (GHSA-rcmh-qjqh-p98v)
- **Severity:** Low
- **Status:** Accepted risk
- **Reason:**
  - Fixing requires downgrading next-auth (breaking change)
  - DoS vulnerability only affects address parsing with untrusted input
  - We only use nodemailer for sending emails, not parsing untrusted addresses
  - The vulnerability is low severity
  - Will be resolved when next-auth updates to support newer nodemailer

## Resolution Plan

- Monitor for next-auth updates that support nodemailer > 7.0.10
- Reassess when next-auth stable version is released
- Current beta version (5.0.0-beta.30) is required for our auth implementation

## Package Overrides

We use npm overrides to ensure nodemailer v7.0.10 is used consistently across all dependencies to prevent peer dependency conflicts.

```json
"overrides": {
  "nodemailer": "^7.0.10"
}
```

## Last Checked

December 2, 2025
