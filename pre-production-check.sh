#!/bin/bash

# FreshFlow Pre-Production Check Script
# Run this before deploying to production

echo "🚀 FreshFlow Pre-Production Checks"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

WARNINGS=0
ERRORS=0

# Function to check and report
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

echo "1. Security Checks"
echo "=================="

# Check for vulnerabilities
echo -n "Checking for security vulnerabilities... "
if npm audit --production --json | grep -q '"vulnerabilities": {}'; then
    check_pass "No vulnerabilities found"
else
    VULN_COUNT=$(npm audit --production --json | grep -o '"total": [0-9]*' | head -1 | grep -o '[0-9]*')
    if [ "$VULN_COUNT" -gt 0 ]; then
        check_fail "Found $VULN_COUNT vulnerabilities. Run: npm audit fix"
    fi
fi

# Check for hardcoded secrets
echo -n "Checking for hardcoded secrets... "
SECRET_COUNT=$(grep -rn "mongodb+srv://\|sk_live_\|pk_live_\|password.*=.*\"" src/ --exclude-dir=node_modules 2>/dev/null | wc -l)
if [ "$SECRET_COUNT" -eq 0 ]; then
    check_pass "No hardcoded secrets found"
else
    check_fail "Found $SECRET_COUNT potential hardcoded secrets"
fi

# Check .env.local is not in git
echo -n "Checking .env.local is gitignored... "
if git ls-files | grep -q ".env.local"; then
    check_fail ".env.local is tracked in git! Remove it immediately"
else
    check_pass ".env.local is properly ignored"
fi

echo ""
echo "2. Code Quality"
echo "==============="

# Check for console statements
echo -n "Checking for console statements... "
CONSOLE_COUNT=$(grep -r "console.log\|console.error\|console.warn" src/ --exclude-dir=node_modules 2>/dev/null | wc -l)
if [ "$CONSOLE_COUNT" -gt 50 ]; then
    check_warn "Found $CONSOLE_COUNT console statements (consider removing for production)"
else
    check_pass "Console statements: $CONSOLE_COUNT (acceptable)"
fi

# Check for TODO comments
echo -n "Checking for TODO comments... "
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX\|HACK" src/ --exclude-dir=node_modules 2>/dev/null | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
    check_warn "Found $TODO_COUNT TODO comments"
else
    check_pass "No TODO comments found"
fi

# Check TypeScript compilation
echo -n "Checking TypeScript compilation... "
if npm run build > /dev/null 2>&1; then
    check_pass "TypeScript compiles successfully"
else
    check_fail "TypeScript compilation errors. Run: npm run build"
fi

echo ""
echo "3. Dependencies"
echo "==============="

# Check for outdated critical packages
echo -n "Checking for outdated packages... "
OUTDATED=$(npm outdated --json 2>/dev/null)
if [ -z "$OUTDATED" ] || [ "$OUTDATED" = "{}" ]; then
    check_pass "All packages are up to date"
else
    OUTDATED_COUNT=$(echo "$OUTDATED" | grep -o '"wanted":' | wc -l)
    check_warn "$OUTDATED_COUNT packages can be updated. Run: npm update"
fi

echo ""
echo "4. Build & Performance"
echo "======================"

# Check bundle size
echo -n "Checking bundle size... "
if [ -d ".next/static" ]; then
    BUNDLE_SIZE=$(du -sh .next/static | cut -f1)
    check_pass "Bundle size: $BUNDLE_SIZE"
else
    check_warn "No build found. Run: npm run build"
fi

# Check if production build exists
echo -n "Checking production build... "
if [ -f ".next/BUILD_ID" ]; then
    check_pass "Production build exists"
else
    check_warn "No production build. Run: npm run build"
fi

echo ""
echo "5. Environment Configuration"
echo "==========================="

# Check for required env variables
check_env_var() {
    if grep -q "^$1=" .env.local 2>/dev/null; then
        check_pass "$1 is set"
    else
        check_fail "$1 is NOT set in .env.local"
    fi
}

if [ -f ".env.local" ]; then
    check_env_var "MONGODB_URI"
    check_env_var "NEXTAUTH_URL"
    check_env_var "NEXTAUTH_SECRET"
    check_env_var "EMAIL_HOST"
    check_env_var "EMAIL_USER"
    check_env_var "NEXT_PUBLIC_APP_URL"
else
    check_fail ".env.local file not found"
fi

echo ""
echo "6. Files & Structure"
echo "===================="

# Check for important files
check_file() {
    if [ -f "$1" ]; then
        check_pass "$1 exists"
    else
        check_warn "$1 not found (recommended)"
    fi
}

check_file "README.md"
check_file "PRODUCTION_CHECKLIST.md"
check_file ".gitignore"
check_file "package-lock.json"

# Check if node_modules exists
echo -n "Checking node_modules... "
if [ -d "node_modules" ]; then
    check_pass "Dependencies installed"
else
    check_fail "node_modules not found. Run: npm install"
fi

echo ""
echo "7. Git Status"
echo "============="

# Check git status
echo -n "Checking for uncommitted changes... "
if git diff-index --quiet HEAD -- 2>/dev/null; then
    check_pass "No uncommitted changes"
else
    check_warn "You have uncommitted changes"
fi

# Check current branch
BRANCH=$(git branch --show-current 2>/dev/null)
echo -n "Current branch... "
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    check_pass "On main branch"
else
    check_warn "On branch: $BRANCH (not main/master)"
fi

echo ""
echo "=================================="
echo "Summary"
echo "=================================="
echo -e "${GREEN}✓${NC} Passed checks"
echo -e "${YELLOW}⚠${NC} Warnings: $WARNINGS"
echo -e "${RED}✗${NC} Errors: $ERRORS"
echo ""

if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}🚨 CRITICAL ISSUES FOUND! Do not deploy to production!${NC}"
    echo "Please fix the errors above before deploying."
    exit 1
elif [ "$WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warnings found. Review them before deploying.${NC}"
    echo "Consider fixing warnings for optimal production setup."
    exit 0
else
    echo -e "${GREEN}🎉 All checks passed! Ready for production deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push your code"
    echo "2. Set up environment variables in your hosting platform"
    echo "3. Deploy using: vercel --prod"
    echo "4. Run database indexes: curl https://yourdomain.com/api/setup-indexes"
    echo "5. Test webhooks and email notifications"
    exit 0
fi
