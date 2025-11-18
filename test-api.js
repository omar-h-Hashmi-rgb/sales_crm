// API Test Script
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@company.com',
      password: 'password123'
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`   User: ${loginResponse.data.user.name} (${loginResponse.data.user.email})`);
    console.log(`   Tier: ${loginResponse.data.user.tier_level}\n`);

    // Set auth header for subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // Test 2: Get current user
    console.log('2. Testing Get Current User...');
    const userResponse = await axios.get(`${BASE_URL}/auth/me`);
    console.log('✅ Get current user successful');
    console.log(`   User: ${userResponse.data.user.name}\n`);

    // Test 3: Get all leads
    console.log('3. Testing Get Leads...');
    const leadsResponse = await axios.get(`${BASE_URL}/leads`);
    console.log('✅ Get leads successful');
    console.log(`   Found ${leadsResponse.data.leads.length} leads`);
    console.log(`   Total: ${leadsResponse.data.pagination.total}\n`);

    // Test 4: Get users
    console.log('4. Testing Get Users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`);
    console.log('✅ Get users successful');
    console.log(`   Found ${usersResponse.data.users.length} users\n`);

    // Test 5: Get bookings
    console.log('5. Testing Get Bookings...');
    const bookingsResponse = await axios.get(`${BASE_URL}/bookings`);
    console.log('✅ Get bookings successful');
    console.log(`   Found ${bookingsResponse.data.bookings.length} bookings\n`);

    // Test 6: Create a test lead
    console.log('6. Testing Create Lead...');
    const newLead = {
      name: 'Test Lead API',
      phone: '+919999999999',
      email: 'test@example.com',
      location: 'Test City',
      services: ['Testing'],
      source: 'manual',
      notes: 'Created via API test'
    };
    
    const createLeadResponse = await axios.post(`${BASE_URL}/leads`, newLead);
    console.log('✅ Create lead successful');
    console.log(`   Lead ID: ${createLeadResponse.data.lead.id}`);
    console.log(`   Name: ${createLeadResponse.data.lead.name}\n`);

    console.log('🎉 All API tests passed! Backend is working correctly.\n');
    console.log('📊 Summary:');
    console.log('   ✅ Authentication system working');
    console.log('   ✅ User management working');
    console.log('   ✅ Lead management working');
    console.log('   ✅ Booking system working');
    console.log('   ✅ Database connection stable');

  } catch (error) {
    console.error('❌ API Test failed:', error.response?.data || error.message);
  }
}

testAPI();