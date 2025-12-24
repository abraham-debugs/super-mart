# Server Restart Required

The backend server needs to be restarted after adding new routes.

## Steps to Restart:

1. **Stop the current server** (if running):
   - Press `Ctrl+C` in the terminal where the server is running

2. **Start the server again**:
   ```bash
   cd backend
   npm start
   ```
   
   Or if using nodemon:
   ```bash
   cd backend
   npm run dev
   ```

3. **Verify the routes are loaded**:
   - Check the console for: `API listening on http://localhost:5000`
   - Test admin login endpoint: `GET http://localhost:5000/api/auth/admin/test`
   - Should return: `{ "message": "Admin route is accessible", "timestamp": "..." }`

## Routes Added:
- `/api/invoices/:orderId` - Invoice generation
- `/api/auth/admin/test` - Test endpoint for admin routes

## Troubleshooting:

If you still get 404 errors:
1. Check that the server is running on the correct port (default: 5000)
2. Verify the API_BASE URL in frontend matches the backend URL
3. Check browser console for CORS errors
4. Verify the route is accessible by testing: `http://localhost:5000/api/auth/admin/test`












