#!/bin/bash
# Security audit script for environment variables
# Usage: ./scripts/security-audit.sh

set -e

echo "🔒 Running security audit..."
echo ""

ERRORS=0

# 1. Check .gitignore
echo "📝 Checking .gitignore..."
if ! grep -q "^\.env$" .gitignore; then
  echo "   ❌ .gitignore missing .env"
  ERRORS=$((ERRORS + 1))
else
  echo "   ✓ .env is in .gitignore"
fi

if ! grep -q "^\.env\*\.local$" .gitignore; then
  echo "   ❌ .gitignore missing .env*.local"
  ERRORS=$((ERRORS + 1))
else
  echo "   ✓ .env*.local is in .gitignore"
fi

# 2. Check for committed secrets
echo ""
echo "📂 Checking for committed .env files..."
if git ls-files | grep -qE "^\.env$|^\.env\.local$|^\.env\.production$"; then
  echo "   ❌ .env files are committed in Git!"
  git ls-files | grep -E "^\.env"
  ERRORS=$((ERRORS + 1))
else
  echo "   ✓ No .env files committed"
fi

# 3. Check .env.example
echo ""
echo "📋 Checking .env.example for real secrets..."
if grep -qE "(eyJ[A-Za-z0-9_-]{100,}|sk_test_[A-Za-z0-9]{20,}|sk_live_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,})" .env.example; then
  echo "   ❌ Real secrets found in .env.example!"
  echo "   Detected patterns:"
  grep -E "(eyJ|sk_test|sk_live|whsec)" .env.example
  ERRORS=$((ERRORS + 1))
else
  echo "   ✓ .env.example contains only placeholders"
fi

# 4. Check for hardcoded secrets in source code
echo ""
echo "🔍 Checking for hardcoded secrets in src/..."
if grep -rE "(eyJ[A-Za-z0-9_-]{100,}|sk_test_[A-Za-z0-9]{20,}|sk_live_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,})" src/ --include="*.js" --include="*.jsx" 2>/dev/null; then
  echo "   ❌ Hardcoded secrets found in source code!"
  ERRORS=$((ERRORS + 1))
else
  echo "   ✓ No hardcoded secrets detected"
fi

# 5. Check NEXT_PUBLIC_ misuse
echo ""
echo "🛡️  Checking NEXT_PUBLIC_ usage..."
if grep -rE "NEXT_PUBLIC_(SECRET|SERVICE_ROLE|PRIVATE|WEBHOOK)" src/ --include="*.js" --include="*.jsx" 2>/dev/null; then
  echo "   ❌ Server-only keys exposed as NEXT_PUBLIC_!"
  ERRORS=$((ERRORS + 1))
else
  echo "   ✓ No server-only keys exposed as public"
fi

# 6. Check that service role key is only in admin.js
echo ""
echo "🔑 Checking SUPABASE_SERVICE_ROLE_KEY usage..."
SERVICE_ROLE_FILES=$(grep -rl "SUPABASE_SERVICE_ROLE_KEY" src/ --include="*.js" 2>/dev/null || true)
if [ -n "$SERVICE_ROLE_FILES" ]; then
  if [ "$SERVICE_ROLE_FILES" = "src/lib/supabase/admin.js" ]; then
    echo "   ✓ SUPABASE_SERVICE_ROLE_KEY only in admin.js"
  else
    echo "   ⚠️  SUPABASE_SERVICE_ROLE_KEY found in multiple files:"
    echo "$SERVICE_ROLE_FILES"
  fi
else
  echo "   ⚠️  SUPABASE_SERVICE_ROLE_KEY not found (might be missing)"
fi

# 7. Check that Stripe secret is only in API routes
echo ""
echo "💳 Checking STRIPE_SECRET_KEY usage..."
STRIPE_FILES=$(grep -rl "STRIPE_SECRET_KEY" src/ --include="*.js" 2>/dev/null || true)
if [ -n "$STRIPE_FILES" ]; then
  # Should only be in src/app/api/
  NON_API_FILES=$(echo "$STRIPE_FILES" | grep -v "src/app/api/" || true)
  if [ -n "$NON_API_FILES" ]; then
    echo "   ❌ STRIPE_SECRET_KEY found outside API routes:"
    echo "$NON_API_FILES"
    ERRORS=$((ERRORS + 1))
  else
    echo "   ✓ STRIPE_SECRET_KEY only in API routes"
  fi
else
  echo "   ⚠️  STRIPE_SECRET_KEY not found (might be missing)"
fi

# Summary
echo ""
echo "============================================================"
if [ $ERRORS -eq 0 ]; then
  echo "✅ Security audit PASSED"
  echo "   No security issues detected"
  echo "============================================================"
  exit 0
else
  echo "❌ Security audit FAILED"
  echo "   $ERRORS issue(s) detected"
  echo ""
  echo "📚 See docs/SECURITY_ENV_CHECKLIST.md for remediation"
  echo "============================================================"
  exit 1
fi
