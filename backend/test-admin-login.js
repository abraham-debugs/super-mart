// Test script to verify admin login endpoint
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const email = '231401032@rajalakshmi.edu.in';
const password = 'SuperAdmin@2024';

console.log('Testing admin login endpoint...');
console.log('API Base:', API_BASE);
console.log('Email:', email);
console.log('');

try {
  const payload = { email, password };
  console.log('Request payload:', JSON.stringify(payload));
  console.log('Password length:', password.length);
  console.log('Password chars:', password.split('').map(c => c.charCodeAt(0)).join(','));
  
  const response = await fetch(`${API_BASE}/api/auth/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  console.log('Response Status:', response.status);
  console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
  
  const data = await response.json();
  console.log('Response Body:', JSON.stringify(data, null, 2));
  
  if (response.ok) {
    console.log('');
    console.log('✅ Login successful!');
    console.log('Token:', data.token ? data.token.substring(0, 50) + '...' : 'Missing');
    console.log('User:', data.user);
  } else {
    console.log('');
    console.log('❌ Login failed!');
    console.log('Error:', data.message || 'Unknown error');
  }
} catch (error) {
  console.error('❌ Network error:', error.message);
  console.error('');
  console.error('Possible issues:');
  console.error('1. Backend server is not running');
  console.error('2. Wrong API_BASE URL');
  console.error('3. CORS configuration issue');
  console.error('4. Network connectivity problem');
  console.error('');
  console.error('To fix:');
  console.error('- Make sure backend is running: cd backend && npm start');
  console.error('- Check if API_BASE is correct:', API_BASE);
}

