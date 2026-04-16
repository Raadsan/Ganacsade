const axios = require('axios');

async function testSignup() {
  try {
    console.log('🧪 Testing Sign-Up Endpoint...\n');

    const testUser = {
      email: 'testuser' + Date.now() + '@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+252' + Math.floor(Math.random() * 1000000000),
      role: 'customer'
    };

    console.log('📝 Test User Data:');
    console.log('   Email:', testUser.email);
    console.log('   Password:', testUser.password);
    console.log('   Name:', testUser.firstName, testUser.lastName);
    console.log('   Phone:', testUser.phoneNumber);
    console.log('');

    console.log('📡 Sending POST request to http://localhost:5000/api/auth/register...\n');

    const response = await axios.post('http://localhost:5000/api/auth/register', testUser);

    console.log('✅ Sign-Up Successful!\n');
    console.log('📊 Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('\n🎉 User Created Successfully!');
      console.log('👤 User ID:', response.data.data.user.id);
      console.log('📧 Email:', response.data.data.user.email);
      console.log('📱 Phone:', response.data.data.user.phoneNumber);
      console.log('🔑 Token:', response.data.data.token ? 'Generated ✅' : 'Missing ❌');
      
      console.log('\n🧪 Now testing login with the same credentials...\n');
      
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: testUser.email,
        password: testUser.password
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Login Successful!');
        console.log('📊 Login Response:', JSON.stringify(loginResponse.data, null, 2));
      } else {
        console.log('❌ Login Failed!');
        console.log('📊 Login Response:', JSON.stringify(loginResponse.data, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Sign-Up Failed!\n');
    
    if (error.response) {
      console.log('📊 Status Code:', error.response.status);
      console.log('📦 Error Response:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 409) {
        console.log('\n⚠️  Duplicate user detected (this is expected if running multiple times)');
      }
    } else if (error.request) {
      console.log('📡 No response received from server');
      console.log('⚠️  Is the backend running on port 5000?');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testSignup();
