# 🔒 Security Guidelines for AromaHR

## Overview
This document outlines the security measures implemented in the AromaHR e-commerce platform and provides guidelines for maintaining security.

---

## 🛡️ Implemented Security Measures

### 1. Authentication & Authorization

#### Protected Routes
All sensitive routes are protected using the `ProtectedRoute` component:

```typescript
// Admin-only route
<Route path="/admin" element={
  <ProtectedRoute requiredRole="admin">
    <AdminPanel />
  </ProtectedRoute>
} />

// User-only route
<Route path="/profil" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
```

**Features:**
- ✅ Redirects unauthenticated users to login
- ✅ Checks user role for admin routes
- ✅ Preserves intended destination after login
- ✅ Client-side route protection

**⚠️ Important:** This is client-side protection only. Backend API must also verify authentication and authorization.

---

### 2. Error Handling

#### Error Boundary
The app is wrapped in an `ErrorBoundary` component to catch and handle JavaScript errors gracefully:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Features:**
- ✅ Prevents entire app from crashing
- ✅ Shows user-friendly error message
- ✅ Logs errors to console (can be extended to error tracking service)
- ✅ Provides recovery options (retry, go home)
- ✅ Shows technical details in development mode only

---

### 3. Input Validation

#### Search Query Validation
```typescript
import { validateSearchQuery } from './utils/validation';

const result = validateSearchQuery(userInput);
if (!result.valid) {
  toast.error(result.error);
  return;
}
// Use result.sanitized
```

**Protections:**
- ✅ Maximum length limit (100 characters)
- ✅ HTML/script tag removal
- ✅ Special character sanitization
- ✅ Empty input rejection

#### Email Validation
```typescript
import { isValidEmail } from './utils/validation';

if (!isValidEmail(email)) {
  toast.error('Unesite valjanu email adresu');
  return;
}
```

**Protections:**
- ✅ RFC-compliant email format
- ✅ Maximum length limit (255 characters)
- ✅ Prevents invalid email submissions

#### Password Validation
```typescript
import { validatePassword } from './utils/validation';

const result = validatePassword(password);
if (!result.valid) {
  result.errors.forEach(error => toast.error(error));
  return;
}
```

**Requirements:**
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number
- ✅ At least one special character
- ✅ Not a common password

#### Coupon Validation
```typescript
import { validateCoupon } from './utils/validation';

const result = validateCoupon(couponCode, subtotal);
if (!result.valid) {
  toast.error(result.error);
  return;
}
// Use result.coupon
```

**Protections:**
- ✅ Validates coupon exists
- ✅ Checks minimum order amount
- ✅ Calculates correct discount
- ✅ Applies maximum discount limits
- ✅ Prevents discount exceeding subtotal

---

### 4. XSS Protection

#### React's Built-in Protection
React automatically escapes all JSX content, preventing XSS attacks:

```typescript
// ✅ SAFE - React escapes automatically
<h3>{product.naziv}</h3>
<p>{userInput}</p>
```

#### Dangerous Patterns to Avoid
```typescript
// ❌ NEVER USE
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ NEVER USE
element.innerHTML = userInput;

// ❌ NEVER USE
eval(userInput);
```

**Current Status:** ✅ No dangerous patterns found in codebase

---

### 5. Environment Variables

#### Secure Configuration
```env
# .env (NEVER commit this file)
VITE_SUPABASE_URL=your_actual_url
VITE_SUPABASE_ANON_KEY=your_actual_key
```

**Security Notes:**
- ✅ `.env` is in `.gitignore`
- ✅ `.env.example` provided for documentation
- ✅ Supabase anon key is safe to expose (designed for client-side use)
- ⚠️ NEVER expose `service_role` key in client code
- ✅ All sensitive config uses environment variables

---

### 6. Supabase Security

#### Row Level Security (RLS)
**⚠️ CRITICAL:** All Supabase tables MUST have RLS enabled.

Example RLS policies:

```sql
-- Users can only read their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Only admins can view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (user_id = auth.uid());
```

**Verification Checklist:**
- [ ] RLS enabled on `users` table
- [ ] RLS enabled on `orders` table
- [ ] RLS enabled on `products` table
- [ ] RLS enabled on `product_sizes` table
- [ ] RLS enabled on `coupons` table
- [ ] RLS enabled on `reviews` table
- [ ] Test policies with different user roles

---

## 🚨 Security Checklist for Production

### Before Deployment

#### Environment
- [ ] `.env` file is NOT committed to repository
- [ ] `.env.example` is up to date
- [ ] All environment variables are set in production
- [ ] Supabase RLS is enabled on all tables
- [ ] Supabase RLS policies are tested

#### Code
- [ ] No `console.log` statements in production code
- [ ] No `debugger` statements
- [ ] No test pages accessible in production
- [ ] All TODO comments addressed
- [ ] Error boundary is active
- [ ] Protected routes are working

#### Authentication
- [ ] Password validation is enforced
- [ ] Email validation is enforced
- [ ] Session expiration is configured
- [ ] Logout functionality works correctly
- [ ] Admin routes require admin role

#### Input Validation
- [ ] All user inputs are validated
- [ ] Search queries are sanitized
- [ ] Email addresses are validated
- [ ] Phone numbers are validated
- [ ] Postal codes are validated
- [ ] Quantities are validated

#### Headers & HTTPS
- [ ] HTTPS is enforced
- [ ] Security headers are configured (see below)
- [ ] CORS is properly configured
- [ ] CSP is configured

---

## 🔐 Required Security Headers

Add these headers to your server configuration:

```nginx
# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://gqmvyggenreowrpprpld.supabase.co;" always;

# Prevent clickjacking
add_header X-Frame-Options "DENY" always;

# Prevent MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# HSTS (only after testing HTTPS works)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## 🛠️ Security Testing

### Manual Testing

#### Authentication
1. Try accessing `/admin` without login → Should redirect to `/prijava`
2. Login as regular user, try accessing `/admin` → Should redirect to `/`
3. Login as admin, access `/admin` → Should work
4. Logout, verify session is cleared

#### Input Validation
1. Try submitting empty search → Should show error
2. Try submitting 101+ character search → Should show error
3. Try submitting invalid email → Should show error
4. Try submitting weak password → Should show errors

#### XSS Testing
1. Try entering `<script>alert('XSS')</script>` in search → Should be escaped
2. Try entering HTML tags in forms → Should be escaped
3. Verify no alerts or script execution

### Automated Testing (Future)

```bash
# Install security testing tools
npm install --save-dev @testing-library/react vitest

# Run tests
npm run test

# Security audit
npm audit
npm audit fix
```

---

## 📊 Security Monitoring

### Error Tracking (Recommended)
Integrate with error tracking service:

```typescript
// In ErrorBoundary.tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Send to Sentry, LogRocket, or similar
  Sentry.captureException(error, { extra: errorInfo });
}
```

**Recommended Services:**
- [Sentry](https://sentry.io/) - Error tracking
- [LogRocket](https://logrocket.com/) - Session replay
- [Datadog](https://www.datadoghq.com/) - Full monitoring

### Logging Best Practices
```typescript
// ✅ GOOD - Log errors without sensitive data
console.error('Order creation failed', { orderId, error: error.message });

// ❌ BAD - Don't log sensitive data
console.log('User data', { password, creditCard });
```

---

## 🚀 Security Updates

### Regular Maintenance
- [ ] Update dependencies monthly: `npm update`
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review Supabase security logs
- [ ] Monitor error tracking dashboard
- [ ] Review and update RLS policies

### Incident Response
1. **Detect:** Monitor error logs and security alerts
2. **Assess:** Determine severity and impact
3. **Contain:** Disable affected features if necessary
4. **Fix:** Deploy security patch
5. **Verify:** Test fix in production
6. **Document:** Record incident and resolution

---

## 📞 Security Contacts

**Security Issues:** security@aromahr.hr  
**General Support:** info@aromahr.hr  
**Emergency:** +385 91 234 5678

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [React Security Best Practices](https://react.dev/learn/security)
- [Web Security Cheat Sheet](https://cheatsheetseries.owasp.org/)

---

**Last Updated:** May 5, 2026  
**Version:** 1.0.0  
**Maintained by:** AromaHR Security Team
