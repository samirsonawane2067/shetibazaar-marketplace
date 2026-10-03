const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const productsToSeed = [
  { name: 'Hybrid Tomato Seeds', nameMarathi: 'हायब्रिड टोमॅटो बियाणे', category: 'Seeds', price: 850, unit: '500 grams', sellerName: 'Mahesh Agro Farm', location: 'Nashik', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=900&q=80', tag: 'Best seller', description: 'High-yield hybrid tomato seeds selected for Maharashtra soil and climate.', details: ['Germination 85%+', 'Crop duration 90–100 days', 'Suitable for Maharashtra climate'] },
  { name: 'Premium Onion Seeds', nameMarathi: 'प्रीमियम कांदा बियाणे', category: 'Seeds', price: 1200, unit: '1 kg', sellerName: 'Shinde Seeds', location: 'Pune', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=900&q=80', tag: 'Popular', description: 'Reliable red onion variety with excellent storage life.', details: ['Late kharif variety', 'Strong bulb formation', 'Good storage life'] },
  { name: 'Soybean JS 335 Seeds', nameMarathi: 'सोयाबीन जेएस ३३५ बियाणे', category: 'Seeds', price: 2100, unit: '30 kg bag', sellerName: 'Kisan Mitra', location: 'Akola', rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80', description: 'Trusted soybean seeds for a strong monsoon crop.', details: ['High germination', 'Medium duration', 'Rainfed friendly'] },
  { name: 'Sonalika Wheat Seeds', nameMarathi: 'सोनालिका गहू बियाणे', category: 'Seeds', price: 1450, unit: '40 kg bag', sellerName: 'Patil Agro Farm', location: 'Sangamner', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=80', description: 'Certified wheat seed for consistent winter yields.', details: ['Certified seed', 'Good chapati quality', 'Early maturity'] },
  { name: 'Cotton Hybrid Seeds', nameMarathi: 'कापूस हायब्रिड बियाणे', category: 'Seeds', price: 1800, unit: '450 grams', sellerName: 'AgriTech Solutions', location: 'Nagpur', rating: 4.4, imageUrl: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=900&q=80', description: 'High-yielding cotton hybrid suitable for Vidarbha region.', details: ['Bt cotton variety', 'Pest resistant', '150-180 days duration'] },
  { name: 'Maize Hybrid Seeds', nameMarathi: 'मका हायब्रिड बियाणे', category: 'Seeds', price: 950, unit: '5 kg', sellerName: 'Green Field Seeds', location: 'Solapur', rating: 4.3, imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80', description: 'Fast-growing maize hybrid for green fodder and grain.', details: ['Dual purpose', '90 days maturity', 'High germination'] },
  { name: 'Urea Fertilizer', nameMarathi: 'युरिया खत', category: 'Fertilizers', price: 320, unit: '45 kg bag', sellerName: 'Shree Ganesh Agro', location: 'Kolhapur', rating: 4.4, imageUrl: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=900&q=80', description: 'Balanced crop nutrition from a verified local seller.', details: ['45 kg bag', 'Sealed pack', 'Quick nitrogen release'] },
  { name: 'DAP Fertilizer', nameMarathi: 'डीएपी खत', category: 'Fertilizers', price: 1450, unit: '50 kg bag', sellerName: 'Krushi Kendra', location: 'Satara', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=900&q=80', description: 'Di-ammonium phosphate for root development and flowering.', details: ['18-46-0 NPK', 'Water soluble', 'Boosts flowering'] },
  { name: 'NPK 19-19-19', nameMarathi: 'एनपीके १९-१९-१९', category: 'Fertilizers', price: 850, unit: '25 kg bag', sellerName: 'Agro Inputs Hub', location: 'Latur', rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80', description: 'Balanced fertilizer for all crops and vegetables.', details: ['Water soluble', 'Foliar spray compatible', 'Quick absorption'] },
  { name: 'Mahindra Compatible Rotavator 6 Feet', nameMarathi: 'महिंद्रा सुसंगत रोटाव्हेटर ६ फूट', category: 'Machinery', price: 125000, unit: '1 unit', sellerName: 'Maharashtra Implements', location: 'Pune', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a8f8b?auto=format&fit=crop&w=900&q=80', tag: 'New', description: 'Heavy-duty rotavator built for efficient soil preparation.', details: ['Working width: 6 feet', '35–50 HP compatible', '1 year warranty'] },
  { name: '9 Tyne Heavy Duty Cultivator', nameMarathi: '९ टाईन हेवी ड्युटी कल्टीव्हेटर', category: 'Machinery', price: 65000, unit: '1 unit', sellerName: 'Satara Farm Tools', location: 'Satara', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80', description: 'Strong adjustable cultivator for deep and even tillage.', details: ['9 tyne', 'Adjustable depth', '35–50 HP compatible'] },
  { name: 'Power Tiller 8 HP', nameMarathi: 'पावर टिलर ८ एचपी', category: 'Machinery', price: 85000, unit: '1 unit', sellerName: 'Farm Mechanization', location: 'Nanded', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1563906267088-b029e7101114?auto=format&fit=crop&w=900&q=80', tag: 'Used', description: 'Well-maintained power tiller for small farms.', details: ['8 HP diesel engine', 'Good condition', 'Recently serviced'] },
  { name: 'PTO Shaft Heavy Duty', nameMarathi: 'पीटीओ शाफ्ट हेवी ड्युटी', category: 'Tractor Parts', price: 7800, unit: '1 piece', sellerName: 'Om Tractor Parts', location: 'Sangli', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=900&q=80', description: 'Durable PTO shaft compatible with popular tractor models.', details: ['Heavy-duty cross', 'Universal fit', '12 month warranty'] },
  { name: 'Tractor Battery 88 Ah', nameMarathi: 'ट्रॅक्टर बॅटरी ८८ एएच', category: 'Tractor Parts', price: 6800, unit: '1 piece', sellerName: 'Gokul Auto Works', location: 'Nagar', rating: 4.3, imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80', description: 'Long-life battery for dependable farm starts.', details: ['88 Ah capacity', 'Low maintenance', 'Exchange available'] },
  { name: 'Rotavator Blade Set', nameMarathi: 'रोटाव्हेटर ब्लेड सेट', category: 'Tractor Parts', price: 4500, unit: '1 set', sellerName: 'Tractor Spares Hub', location: 'Jalgaon', rating: 4.4, imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80', description: 'High-quality replacement blades for rotavator.', details: ['72 blades', 'Hardened steel', 'Universal fit'] },
  { name: 'Hydraulic Pump', nameMarathi: 'हायड्रॉलिक पंप', category: 'Tractor Parts', price: 12500, unit: '1 piece', sellerName: 'Agro Hydraulics', location: 'Amravati', rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80', description: 'Replacement hydraulic pump for tractors.', details: ['Direct fit', 'High pressure', '1 year warranty'] },
  { name: 'Tractor Tyre 12.4 x 28', nameMarathi: 'ट्रॅक्टर टायर १२.४ x २८', category: 'Tractor Parts', price: 18500, unit: '1 piece', sellerName: 'Tyre World', location: 'Beed', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80', description: 'Heavy-duty tractor tyre for rear wheel.', details: ['12.4 x 28 size', 'Deep tread', 'Puncture resistant'] },
  { name: 'Jersey Cow', nameMarathi: 'जर्सी गाय', category: 'Livestock', price: 75000, unit: '1 animal', sellerName: 'Vijay Dairy Farm', location: 'Kolhapur', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80', tag: 'Healthy', description: 'Healthy Jersey cow from a well-managed dairy farm.', details: ['Age: 4 years', 'Milk: 10–12 litres/day', 'Vaccination up to date'] },
  { name: 'HF Cow', nameMarathi: 'एचएफ गाय', category: 'Livestock', price: 85000, unit: '1 animal', sellerName: 'Sangli Dairy Collective', location: 'Sangli', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=900&q=80', description: 'Healthy HF cow with excellent milk production.', details: ['Age: 3.5 years', 'Milk: 12–15 litres/day', 'Health records available'] },
  { name: 'Osmanabadi Goat', nameMarathi: 'उस्मानाबादी शेळी', category: 'Livestock', price: 18000, unit: '1 animal', sellerName: 'Dattaguru Goat Farm', location: 'Ahilyanagar', rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=900&q=80', tag: 'Healthy', description: 'Healthy Osmanabadi goat, ideal for local breeding.', details: ['Age: 2 years', 'Female, 38 kg', 'Health: Healthy'] },
  { name: 'Osmanabadi Male Goat', nameMarathi: 'उस्मानाबादी नर शेळा', category: 'Livestock', price: 22000, unit: '1 animal', sellerName: 'Goat Breeding Farm', location: 'Beed', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=900&q=80', description: 'Healthy male goat for breeding purposes.', details: ['Age: 2.5 years', 'Male, 45 kg', 'Excellent breeder'] },
  { name: 'Buffalo Murrah', nameMarathi: 'मुर्रा भेडू', category: 'Livestock', price: 95000, unit: '1 animal', sellerName: 'Dairy Excellence', location: 'Nagpur', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1544985361-b420d7a77043?auto=format&fit=crop&w=900&q=80', description: 'Premium Murrah buffalo with high milk yield.', details: ['Age: 5 years', 'Milk: 8–10 litres/day', 'Fat content 7-8%'] },
  { name: 'Fresh Red Onions', nameMarathi: 'ताजे लाल कांदे', category: 'Vegetables', price: 32, unit: '1 kg', sellerName: 'Savita Farmers Group', location: 'Nashik', rating: 4.4, imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=80', description: 'Fresh farm-direct red onions harvested this week.', details: ['Farm direct', 'Fresh harvest', 'Bulk orders welcome'] },
  { name: 'Fresh Tomatoes', nameMarathi: 'ताजे टोमॅटो', category: 'Vegetables', price: 28, unit: '1 kg', sellerName: 'Kisan Fresh', location: 'Pune', rating: 4.3, imageUrl: 'https://images.unsplash.com/photo-1546470427-227c7369a9b9?auto=format&fit=crop&w=900&q=80', description: 'Ripe red tomatoes, freshly harvested.', details: ['Farm fresh', 'No pesticides', 'Daily harvest'] },
  { name: 'Green Chilli', nameMarathi: 'हिरवी मिरची', category: 'Vegetables', price: 45, unit: '1 kg', sellerName: 'Spice Farmers Co-op', location: 'Sangli', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=900&q=80', description: 'Spicy green chillies, perfect for cooking.', details: ['High spice level', 'Fresh harvest', 'Bulk available'] },
  { name: 'Brinjal Long', nameMarathi: 'लांब वांगे', category: 'Vegetables', price: 35, unit: '1 kg', sellerName: 'Vegetable Growers', location: 'Solapur', rating: 4.2, imageUrl: 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?auto=format&fit=crop&w=900&q=80', description: 'Long purple brinjal, farm fresh.', details: ['Farm fresh', 'No chemicals', 'Daily delivery'] },
  { name: 'Chilli Drip Kit', nameMarathi: 'मिरची ठिबक सिंचन किट', category: 'Equipment', price: 9400, unit: '1 kit', sellerName: 'JalShetu Solutions', location: 'Jalgaon', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=900&q=80', description: 'Water-saving drip kit designed for small and medium farms.', details: ['1 acre kit', 'Easy installation', 'UV protected pipes'] },
  { name: 'Sprayer Pump 16L', nameMarathi: 'स्प्रेयर पंप १६ लिटर', category: 'Equipment', price: 2800, unit: '1 piece', sellerName: 'Agro Equipment Hub', location: 'Ahilyanagar', rating: 4.4, imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=900&q=80', description: 'Manual sprayer pump for pesticide application.', details: ['16 litre capacity', 'Pressure adjustable', 'Easy to carry'] },
  { name: 'Solar Water Pump 5HP', nameMarathi: 'सोलर पाणी पंप ५ एचपी', category: 'Equipment', price: 45000, unit: '1 unit', sellerName: 'Solar Agro Tech', location: 'Latur', rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80', tag: 'New', description: 'Solar-powered water pump for irrigation.', details: ['5 HP capacity', 'AC/DC compatible', '5 year warranty'] },
  { name: 'Cultivator Tine Set', nameMarathi: 'कल्टीव्हेटर टाईन सेट', category: 'Tractor Parts', price: 3200, unit: '1 set', sellerName: 'Farm Parts Depot', location: 'Nanded', rating: 4.3, imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80', description: 'Replacement tines for cultivator.', details: ['9 tines', 'Hardened steel', 'Easy to install'] },
  { name: 'Clutch Plate', nameMarathi: 'क्लच प्लेट', category: 'Tractor Parts', price: 4200, unit: '1 piece', sellerName: 'Tractor Mechanics', location: 'Amravati', rating: 4.4, imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80', description: 'Heavy-duty clutch plate for tractors.', details: ['Universal fit', 'High durability', 'Heat resistant'] },
  { name: 'Hydraulic Hose', nameMarathi: 'हायड्रॉलिक होज', category: 'Tractor Parts', price: 850, unit: '1 piece', sellerName: 'Hydraulic Solutions', location: 'Beed', rating: 4.2, imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80', description: 'High-pressure hydraulic hose for tractors.', details: ['2 meter length', 'Burst proof', 'Universal fittings'] }
];

const categories = [
  { name: 'Seeds', marathi: 'बियाणे', icon: 'Seedling' },
  { name: 'Vegetables', marathi: 'भाज्या', icon: 'Leaf' },
  { name: 'Machinery', marathi: 'यंत्रसामग्री', icon: 'Tractor' },
  { name: 'Tractor Parts', marathi: 'ट्रॅक्टरचे भाग', icon: 'Cog' },
  { name: 'Fertilizers', marathi: 'खते', icon: 'Flask' },
  { name: 'Livestock', marathi: 'पशुधन', icon: 'Cow' },
  { name: 'Equipment', marathi: 'उपकरणे', icon: 'Tools' }
];

async function main() {
  console.log('Starting seed...');

  // 1. Clear existing data in correct order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('Cleared existing data.');

  // 2. Create admin
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@shetibazaar.in',
      passwordHash: adminPasswordHash,
      role: 'admin'
    }
  });

  // 3 & 4. Create demo farmers
  const demoPasswordHash = await bcrypt.hash('demo123', 10);
  
  const farmer1 = await prisma.user.create({
    data: {
      name: 'Ramesh Patil',
      email: 'ramesh@demo.com',
      passwordHash: demoPasswordHash,
      farmName: 'Patil Agro Farm',
      location: 'Sangamner, Ahilyanagar, Maharashtra',
      mobile: '9876543210'
    }
  });

  const farmer2 = await prisma.user.create({
    data: {
      name: 'Mahesh Kumar',
      email: 'mahesh@demo.com',
      passwordHash: demoPasswordHash,
      farmName: 'Mahesh Agro Farm',
      location: 'Nashik, Maharashtra',
      mobile: '9876543211'
    }
  });

  console.log('Created users.');

  // 5. Create categories
  await prisma.category.createMany({
    data: categories
  });
  console.log('Created categories.');

  // 6. Create products
  let i = 0;
  for (const prod of productsToSeed) {
    const seller = i % 2 === 0 ? farmer1 : farmer2;
    await prisma.product.create({
      data: {
        ...prod,
        sellerId: seller.id
      }
    });
    i++;
  }
  
  console.log('Created products.');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
