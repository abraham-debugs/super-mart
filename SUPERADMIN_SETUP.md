# SuperAdmin Feature Setup Guide

## Overview

The application now has a role-based access control system with three user roles:
- **User** (default): Regular customers
- **Admin**: Can manage products, categories, orders, and users, but CANNOT delete products
- **SuperAdmin**: Has all admin privileges PLUS the ability to delete products

## Database Changes

### User Model
Added a `role` field to the User schema:
```javascript
role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" }
```

## Backend Changes

### Middleware (backend/src/middleware/auth.js)
- `requireAuth`: Validates JWT token
- `requireAdmin`: Requires user to have "admin" or "superadmin" role
- `requireSuperAdmin`: Requires user to have "superadmin" role

### Protected Routes
- **DELETE /api/admin/products/:id**: Now requires `superadmin` role only

### JWT Token
The JWT token now includes the user's role for authorization checks.

## Frontend Changes

### Pages
- **Admin Page** (`/admin`): Delete button for products is hidden unless user has `superadmin` role
- **SuperAdmin Page** (`/superadmin`): Shows all admin features including product deletion (identical interface, no restrictions)

### Auth Context
Updated to include `role` in the user object.

## How to Test

### 1. Create a SuperAdmin User

Since the registration endpoint creates users with the default "user" role, you need to manually update a user's role in the database:

**Using MongoDB Compass or mongosh:**
```javascript
db.users.updateOne(
  { email: "youremail@example.com" },
  { $set: { role: "superadmin" } }
)
```

**Or create an admin user:**
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### 2. Login and Access Pages

1. Login with the user whose role you updated
2. Navigate to:
   - `/admin` - Admin page (delete button hidden for products if role is "admin")
   - `/superadmin` - SuperAdmin page (all features including product deletion)

### 3. Test Permissions

**As Admin:**
- Can create, edit categories
- Can create, edit products (but NOT delete)
- Can manage orders and users
- Delete button will not appear in product management

**As SuperAdmin:**
- All admin capabilities
- Can delete products
- Delete button appears in product management

## API Response Examples

### Login Response (with role)
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "superadmin",
    "isProfileComplete": true
  }
}
```

### Protected Endpoint Error (403)
When a regular admin tries to delete a product:
```json
{
  "message": "Super admin access required"
}
```

## Future Enhancements

Consider adding:
1. User management UI in admin panel to assign roles
2. More granular permissions system
3. Audit logs for sensitive actions
4. Role-based dashboard customization

## Security Notes

- Role information is stored in JWT token (ensure token security)
- Always validate role on backend, never trust frontend-only checks
- Superadmin role should be granted sparingly
- Consider implementing 2FA for superadmin accounts

## Files Modified

### Backend
- `backend/src/models/User.js` - Added role field
- `backend/src/middleware/auth.js` - Added role-based middleware
- `backend/src/routes/auth.js` - Updated JWT signing and responses to include role
- `backend/src/routes/admin.js` - Protected delete product route

### Frontend
- `frontend/src/contexts/AuthContext.tsx` - Added role to User type
- `frontend/src/pages/Admin.tsx` - Added conditional delete button
- `frontend/src/pages/SuperAdmin.tsx` - New page with full admin access
- `frontend/src/App.tsx` - Added /superadmin route








