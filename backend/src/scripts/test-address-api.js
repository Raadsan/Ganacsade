const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials (use a real user from your database)
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

async function testAddressAPI() {
  try {
    console.log('🔐 Step 1: Login to get token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful! Token:', token.substring(0, 20) + '...');
    
    // Set up headers with token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n📋 Step 2: Get existing addresses...');
    const getResponse = await axios.get(`${BASE_URL}/customer/addresses`, { headers });
    console.log('✅ Get addresses response:', JSON.stringify(getResponse.data, null, 2));
    
    console.log('\n➕ Step 3: Create new address...');
    const newAddress = {
      title: 'Home',
      fullName: 'Test User',
      phoneNumber: '+252 61 234 5678',
      street: 'Maka Al Mukarama Road',
      city: 'Mogadishu',
      state: 'Banaadir',
      country: 'Somalia',
      postalCode: '',
      isDefault: true
    };
    
    console.log('Sending address data:', JSON.stringify(newAddress, null, 2));
    
    const createResponse = await axios.post(
      `${BASE_URL}/customer/addresses`,
      newAddress,
      { headers }
    );
    
    console.log('✅ Create address response:', JSON.stringify(createResponse.data, null, 2));
    
    console.log('\n📋 Step 4: Get addresses again to verify...');
    const getResponse2 = await axios.get(`${BASE_URL}/customer/addresses`, { headers });
    console.log('✅ Updated addresses:', JSON.stringify(getResponse2.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAddressAPI();
