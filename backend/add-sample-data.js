// Add sample data for dashboard
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ganacsade_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function addSampleData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('📦 Adding sample data...\n');

    // 1. Add sample customers
    console.log('👥 Adding customers...');
    const password = await bcrypt.hash('customer123', 10);
    
    const customers = [];
    const customerNames = [
      ['Ahmed', 'Mohamed'],
      ['Fatima', 'Hassan'],
      ['Omar', 'Ali'],
      ['Amina', 'Abdi'],
      ['Yusuf', 'Ibrahim']
    ];
    
    for (const [firstName, lastName] of customerNames) {
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      const phone = `+25261${Math.floor(1000000 + Math.random() * 9000000)}`;
      
      const result = await client.query(
        `INSERT INTO users (email, phone_number, password_hash, first_name, last_name, role, status)
         VALUES ($1, $2, $3, $4, $5, 'customer', 'active')
         RETURNING id`,
        [email, phone, password, firstName, lastName]
      );
      customers.push(result.rows[0].id);
    }
    console.log(`✅ Added ${customers.length} customers`);

    // 2. Get categories
    const categoriesResult = await client.query('SELECT id FROM categories LIMIT 3');
    const categoryIds = categoriesResult.rows.map(r => r.id);

    // 3. Add sample products
    console.log('\n📱 Adding products...');
    const products = [];
    const productData = [
      ['Samsung Galaxy S24', 'Samsung Galaxy S24', 'سامسونج جالاكسي S24', 899.99, 50],
      ['iPhone 15 Pro', 'iPhone 15 Pro', 'آيفون 15 برو', 1199.99, 30],
      ['Nike Air Max', 'Nike Air Max', 'نايكي إير ماكس', 149.99, 100],
      ['Adidas Ultraboost', 'Adidas Ultraboost', 'أديداس ألتراboost', 179.99, 75],
      ['Wireless Headphones', 'Dhagaysiga Wireless', 'سماعات لاسلكية', 89.99, 120],
    ];

    for (let i = 0; i < productData.length; i++) {
      const [nameEn, nameSo, nameAr, price, stock] = productData[i];
      const categoryId = categoryIds[i % categoryIds.length];
      
      const result = await client.query(
        `INSERT INTO products (
          name_en, name_so, name_ar,
          description_en, description_so, description_ar,
          category_id, price, stock_quantity, sku, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
        RETURNING id`,
        [
          nameEn, nameSo, nameAr,
          `High quality ${nameEn}`, `Tayada sare ${nameSo}`, `جودة عالية ${nameAr}`,
          categoryId, price, stock, `SKU-${1000 + i}`
        ]
      );
      products.push({ id: result.rows[0].id, price });
    }
    console.log(`✅ Added ${products.length} products`);

    // 4. Add sample orders
    console.log('\n🛒 Adding orders...');
    const orderStatuses = ['pending', 'confirmed', 'processing', 'delivered', 'delivered'];
    const paymentStatuses = ['completed', 'completed', 'pending', 'completed', 'completed'];
    
    for (let i = 0; i < 5; i++) {
      const customerId = customers[i];
      const product = products[i];
      const quantity = Math.floor(1 + Math.random() * 3);
      const subtotal = product.price * quantity;
      const tax = subtotal * 0.05;
      const shipping = 5.00;
      const total = subtotal + tax + shipping;
      
      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (
          user_id, order_number, subtotal, tax, shipping, discount, total,
          status, payment_status,
          shipping_address, payment_method
        ) VALUES ($1, $2, $3, $4, $5, 0, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          customerId,
          `ORD-${10001 + i}`,
          subtotal,
          tax,
          shipping,
          total,
          orderStatuses[i],
          paymentStatuses[i],
          JSON.stringify({
            fullName: customerNames[i].join(' '),
            phone: `+25261${Math.floor(1000000 + Math.random() * 9000000)}`,
            addressLine1: 'Mogadishu, Somalia',
            city: 'Mogadishu',
            country: 'Somalia'
          }),
          JSON.stringify({
            type: 'cash_on_delivery',
            displayName: 'Cash on Delivery'
          })
        ]
      );
      
      const orderId = orderResult.rows[0].id;
      
      // Add order items
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, unit_price, quantity, total
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, product.id, productData[i][0], product.price, quantity, subtotal]
      );
    }
    console.log(`✅ Added 5 orders`);

    await client.query('COMMIT');
    
    console.log('\n🎉 Sample data added successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Orders: 5`);
    console.log('\n✅ Dashboard should now show real data!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addSampleData().catch(console.error);
