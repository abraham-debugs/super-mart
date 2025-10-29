# Admin Login Debugging Guide

## Current Issue
Login with `231401032@rajalakshmi.edu.in` / `SuperAdmin@2024` returns 401 "Invalid credentials"

## What Has Been Fixed
1. ✅ User exists in database
2. ✅ Password hash is correct
3. ✅ Role is set to "superadmin"
4. ✅ Password verification works directly against database

## Next Steps

### 1. Restart Backend Server
The authentication route code has been updated with detailed logging. Restart is required:

```bash
cd backend
npm start
# or
npm run dev
```

### 2. Watch Server Logs
When you attempt login, you should see detailed logs like:
```
[Admin Login] Attempt from email: 231401032@rajalakshmi.edu.in
[Admin Login] Password length: 15
[Admin Login] Normalized email: 231401032@rajalakshmi.edu.in
[Admin Login] ✅ User found: ...
[Admin Login] ✅ Password hash exists
[Admin Login] Password verification result: true/false
```

### 3. Check Console Output
The logs will show exactly where the login is failing:
- User not found
- No password hash
- Password mismatch
- Role check failed

### 4. Test Endpoint Directly
You can also test with:
```bash
cd backend
node test-admin-login.js
```

## Files Modified
- `backend/src/routes/auth.js` - Added detailed logging to admin login route
- `backend/create-superadmin.js` - Script to create/update superadmin
- `backend/fix-superadmin-password.js` - Script to fix password hash

## Verification Scripts
- `backend/verify-superadmin.js` - Verify user exists and password works
- `backend/debug-login.js` - Step-by-step login verification
- `backend/test-admin-login.js` - Test login API endpoint

