const pool = require('./config');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('🌱 Starting ShetiBazaar Database Seeding...');
  try {
    // 1. Seed Admin
    const adminEmail = 'admin@shetibazaar.com';
    const adminExists = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);

    if (adminExists.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminHash = await bcrypt.hash('admin123', salt);
      await pool.query(
        `INSERT INTO users (name, email, password, phone, village, district, state, role, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        ['Admin Patil', adminEmail, adminHash, '9988776655', 'Pune City', 'Pune', 'Maharashtra', 'admin', true]
      );
      console.log('✅ Admin user created: admin@shetibazaar.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // 2. Seed Demo Farmer (Ramesh Patil)
    const farmerEmail = 'ramesh@demo.com';
    let farmerUser = null;
    const farmerExists = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [farmerEmail]);

    if (farmerExists.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const farmerHash = await bcrypt.hash('demo123', salt);
      const res = await pool.query(
        `INSERT INTO users (name, email, password, phone, village, district, state, pincode, farm_name, farm_size, role, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id, name, email`,
        [
          'Ramesh Patil',
          farmerEmail,
          farmerHash,
          '9876543210',
          'Baramati',
          'Pune',
          'Maharashtra',
          '413102',
          'Patil Organic Farms',
          '10 Acres',
          'farmer',
          true,
        ]
      );
      farmerUser = res.rows[0];
      console.log('✅ Demo Farmer created: ramesh@demo.com / demo123 (Mobile: 9876543210)');
    } else {
      farmerUser = farmerExists.rows[0];
      console.log('ℹ️ Demo Farmer ramesh@demo.com already exists');
    }

    // 3. Seed Sample Products
    const productsCount = await pool.query('SELECT count(*) FROM products');
    if (parseInt(productsCount.rows[0].count, 10) === 0 && farmerUser) {
      const sampleProducts = [
        {
          name: 'Alphonso Mangoes - Devgad Pure',
          name_marathi: 'देवगड हापूस आंबा',
          category: 'Fruits',
          description: 'Naturally ripened, export-quality GI tagged Devgad Alphonso mangoes fresh from Konkan orchard.',
          price: 900.0,
          quantity: 50,
          unit: 'dozen',
          location: 'Devgad, Sindhudurg',
          image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
          tag: 'Organic',
          rating: 4.9,
          review_count: 24,
          status: 'approved',
        },
        {
          name: 'Nashik Red Onions (Export Quality)',
          name_marathi: 'नाशिक लाल कांदा',
          category: 'Vegetables',
          description: 'High-grade medium size Nashik red onions with long shelf life, harvested this season.',
          price: 25.0,
          quantity: 2000,
          unit: 'kg',
          location: 'Lasalgaon, Nashik',
          image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600',
          tag: 'Fresh',
          rating: 4.8,
          review_count: 18,
          status: 'approved',
        },
        {
          name: 'Soybean Seeds JS-335 Certified',
          name_marathi: 'सोयाबीन बियाणे JS-335',
          category: 'Seeds',
          description: 'Certified germination tested 98% pure JS-335 soybean seeds for kharif season.',
          price: 85.0,
          quantity: 500,
          unit: 'kg',
          location: 'Amravati',
          image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
          tag: 'Certified',
          rating: 4.7,
          review_count: 12,
          status: 'approved',
        },
        {
          name: 'Pure Gir Cow A2 Desi Cow',
          name_marathi: 'शुद्ध गीर गाय (A2 दूध)',
          category: 'Livestock',
          description: 'Healthy pure-breed Gir cow, 2nd lactation, giving 12-14 liters daily milk with veterinary certificate.',
          price: 65000.0,
          quantity: 1,
          unit: 'animal',
          location: 'Baramati, Pune',
          image_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600',
          tag: 'Verified',
          rating: 5.0,
          review_count: 8,
          status: 'approved',
        },
        {
          name: 'Mahindra 575 DI Tractor Parts & Cultivator',
          name_marathi: 'महिंद्रा ट्रॅक्टर अवजारे आणि कल्टिव्हेटर',
          category: 'Machinery',
          description: 'Heavy duty 9-tyne cultivator in excellent operating condition, ready for plowing.',
          price: 28000.0,
          quantity: 2,
          unit: 'piece',
          location: 'Kolhapur',
          image_url: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600',
          tag: 'Used',
          rating: 4.6,
          review_count: 15,
          status: 'approved',
        },
        {
          name: 'Organic Vermicompost Khad',
          name_marathi: 'सेंद्रिय गांडूळखत',
          category: 'Fertilizers',
          description: '100% natural organic vermicompost enriched with beneficial soil microbes and micronutrients.',
          price: 12.0,
          quantity: 1500,
          unit: 'kg',
          location: 'Satara',
          image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600',
          tag: 'Organic',
          rating: 4.9,
          review_count: 31,
          status: 'approved',
        },
      ];

      for (const p of sampleProducts) {
        await pool.query(
          `INSERT INTO products (seller_id, name, name_marathi, category, description, price, quantity, unit, location, image_url, tag, rating, review_count, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            farmerUser.id,
            p.name,
            p.name_marathi,
            p.category,
            p.description,
            p.price,
            p.quantity,
            p.unit,
            p.location,
            p.image_url,
            p.tag,
            p.rating,
            p.review_count,
            p.status,
          ]
        );
      }
      console.log(`✅ Seeded ${sampleProducts.length} agricultural products for marketplace`);
    } else {
      console.log(`ℹ️ Products table already has records (${productsCount.rows[0].count})`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
