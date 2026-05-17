# 🚀 Quick Security Reference Guide
## AromaHR - Developer Cheat Sheet

**Last Updated:** May 5, 2026  
**Quick access to security features and best practices**

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Protect a Route
```typescript
import ProtectedRoute from './components/ProtectedRoute';

// User must be logged in
<Route path="/settings" element={
  <ProtectedRoute>
    <SettingsPage />
  </ProtectedRoute>
} />

// User must be admin
<Route path="/admin" element={
  <ProtectedRoute requiredRole="admin">
    <AdminPanel />
  </ProtectedRoute>
} />
```

### Check if User is Logged In
```typescript
import { useAuth } from './store/cartStore';

const { user } = useAuth();

if (!user) {
  // User not logged in
}

if (user.role === 'admin') {
  // User is admin
}
```

---

## ✅ INPUT VALIDATION

### Email
```typescript
import { isValidEmail } from './utils/validation';

if (!isValidEmail(email)) {
  toast.error('Unesite valjanu email adresu');
  return;
}
```

### Password
```typescript
import { validatePassword } from './utils/validation';

const result = validatePassword(password);
if (!result.valid) {
  result.errors.forEach(error => toast.error(error));
  return;
}
```

**Requirements:**
- ✅ Min 8 characters
- ✅ Uppercase letter
- ✅ Lowercase letter
- ✅ Number
- ✅ Special character

### Phone Number
```typescript
import { isValidCroatianPhone } from './utils/validation';

if (!isValidCroatianPhone(phone)) {
  toast.error('Unesite valjani broj telefona');
  return;
}
```

**Formats:** `+385XXXXXXXXX` or `0XXXXXXXXX`

### Postal Code
```typescript
import { isValidCroatianPostalCode } from './utils/validation';

if (!isValidCroatianPostalCode(postalCode)) {
  toast.error('Unesite valjani poštanski broj');
  return;
}
```

**Format:** 5 digits (10000-59999)

### Search Query
```typescript
import { validateSearchQuery } from './utils/validation';

const result = validateSearchQuery(query);
if (!result.valid) {
  toast.error(result.error);
  return;
}
// Use result.sanitized
```

### Coupon Code
```typescript
import { validateCoupon } from './utils/validation';

const result = validateCoupon(couponCode, subtotal);
if (!result.valid) {
  toast.error(result.error);
  return;
}
// Use result.coupon
```

### Quantity
```typescript
import { validateQuantity } from './utils/validation';

const result = validateQuantity(quantity, maxStock);
if (!result.valid) {
  toast.error(result.error);
  return;
}
```

---

## 🛡️ ERROR HANDLING

### Wrap Component in Error Boundary
```typescript
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Try-Catch for Async Operations
```typescript
try {
  await riskyOperation();
  toast.success('Uspješno!');
} catch (error) {
  toast.error('Operacija nije uspjela');
  console.error('Error:', error);
}
```

---

## 🔒 SECURITY BEST PRACTICES

### ✅ DO
- ✅ Validate all user inputs
- ✅ Use ProtectedRoute for sensitive pages
- ✅ Handle errors gracefully
- ✅ Sanitize user input before display
- ✅ Use environment variables for secrets
- ✅ Enable Supabase RLS on all tables
- ✅ Test with different user roles

### ❌ DON'T
- ❌ Trust client-side validation alone
- ❌ Use `dangerouslySetInnerHTML` with user input
- ❌ Commit `.env` file
- ❌ Log sensitive data (passwords, tokens)
- ❌ Use `eval()` or `Function()` constructor
- ❌ Expose service_role key in client code
- ❌ Skip input validation

---

## 🎨 TOAST NOTIFICATIONS

### Success
```typescript
toast.success('Uspješno!', {
  style: { 
    background: '#111111', 
    color: '#e8d5a3', 
    border: '1px solid rgba(201,169,110,0.3)' 
  },
  iconTheme: { 
    primary: '#c9a96e', 
    secondary: '#0a0a0a' 
  },
});
```

### Error
```typescript
toast.error('Greška!', {
  style: { 
    background: '#111111', 
    color: '#e8d5a3', 
    border: '1px solid rgba(239,68,68,0.3)' 
  },
  iconTheme: { 
    primary: '#ef4444', 
    secondary: '#0a0a0a' 
  },
});
```

---

## 🗄️ SUPABASE SECURITY

### Enable RLS on Table
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Users can view own data
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- Users can update own data
CREATE POLICY "Users can update own data"
ON table_name FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all"
ON table_name FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

### Test RLS Policies
```typescript
// Test as regular user
const { data, error } = await supabase
  .from('orders')
  .select('*');

// Test as admin
const { data, error } = await supabase
  .from('orders')
  .select('*');
```

---

## 🌐 ENVIRONMENT VARIABLES

### Setup
```bash
# Copy template
cp .env.example .env

# Edit .env with your values
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### Usage
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### Security Notes
- ✅ Anon key is safe to expose (designed for client-side)
- ❌ NEVER expose service_role key
- ✅ Always use RLS to protect data
- ❌ NEVER commit .env file

---

## 🧪 TESTING SECURITY

### Test Protected Routes
```bash
# 1. Not logged in → should redirect to /prijava
Visit: /admin

# 2. Logged in as user → should redirect to /
Login as user, visit: /admin

# 3. Logged in as admin → should work
Login as admin, visit: /admin
```

### Test Input Validation
```bash
# 1. Empty input → should show error
Submit empty search

# 2. Too long input → should show error
Submit 101+ character search

# 3. Invalid email → should show error
Submit "notanemail"

# 4. Weak password → should show errors
Submit "weak"
```

### Test Error Boundary
```typescript
// Trigger error in component
throw new Error('Test error');

// Should show error UI, not crash app
```

---

## 📋 PRE-LAUNCH CHECKLIST

### Security
- [ ] Supabase RLS enabled on all tables
- [ ] RLS policies tested with different roles
- [ ] Security headers configured
- [ ] HTTPS enabled and forced
- [ ] .env not committed
- [ ] No console.logs in production

### Code Quality
- [ ] No TypeScript errors
- [ ] Build successful
- [ ] All tests passing
- [ ] Test pages removed
- [ ] Dead code removed

### Functionality
- [ ] Protected routes working
- [ ] Error boundary active
- [ ] All forms validated
- [ ] Toast notifications styled
- [ ] Mobile responsive

---

## 🆘 COMMON ISSUES

### "Cannot access /admin"
**Solution:** Check if user is logged in and has admin role
```typescript
const { user } = useAuth();
console.log('User:', user);
console.log('Role:', user?.role);
```

### "Validation not working"
**Solution:** Import from correct path
```typescript
// ✅ Correct
import { isValidEmail } from './utils/validation';

// ❌ Wrong
import { isValidEmail } from '../validation';
```

### "Supabase RLS blocking queries"
**Solution:** Check RLS policies
```sql
-- View policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Disable RLS temporarily for testing (NOT in production!)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

---

## 📞 QUICK CONTACTS

**Security Issues:** security@aromahr.hr  
**Technical Support:** info@aromahr.hr  
**Emergency:** +385 91 234 5678

**Documentation:**
- Full Security Guide: `SECURITY.md`
- Implementation Details: `SECURITY_FIXES_IMPLEMENTED.md`
- Audit Report: `COMPREHENSIVE_AUDIT_REPORT.md`

---

## 🔗 USEFUL LINKS

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Security Best Practices](https://react.dev/learn/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Cheat Sheet](https://cheatsheetseries.owasp.org/)

---

**Keep this file handy for quick reference during development!** 🚀
