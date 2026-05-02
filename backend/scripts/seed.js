/**
 * Seed script — populates MongoDB with locations, users (all roles),
 * niche-specific Dry Fruits and Raw Herbs products, and sample transactions.
 * Run once: node scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Transaction = require('../src/models/Transaction');
const Location = require('../src/models/Location');
const Notification = require('../src/models/Notification');

const BASE_URL = 'http://localhost:5001/images/products';

async function seed() {
  await connectDB();
  console.log('🗑️  Refreshing data for Dry Fruits & Herbs niche...');

  await User.deleteMany({});
  await Product.deleteMany({});
  await Transaction.deleteMany({});
  await Location.deleteMany({});
  await Notification.deleteMany({});

  // ─── Locations ──────────────────────────────────────────────────────────
  const [mainWarehouse, branchStore] = await Location.create([
    { name: 'Main Warehouse', address: '123 Industrial Area, Mumbai 400001' },
    { name: 'Branch Store', address: '456 Market Road, Pune 411001' },
  ]);
  console.log('✅ 2 locations created');

  // ─── Users (all 4 roles) ───────────────────────────────────────────────
  const admin = await User.create({
    name: 'Shop Admin',
    email: 'admin@inventory.com',
    password: 'admin123',
    role: 'admin',
  });

  await User.create({
    name: 'Store Manager',
    email: 'manager@inventory.com',
    password: 'manager123',
    role: 'manager',
    location: mainWarehouse._id,
  });

  await User.create({
    name: 'Warehouse Worker',
    email: 'worker@inventory.com',
    password: 'worker123',
    role: 'worker',
    location: mainWarehouse._id,
  });

  await User.create({
    name: 'Business Owner',
    email: 'owner@inventory.com',
    password: 'owner123',
    role: 'owner',
  });

  console.log('✅ 4 users created (admin, manager, worker, owner)');

  // ─── Products ──────────────────────────────────────────────────────────
  const PRODUCTS = [
    {
      name: 'Premium Almonds (Badam)',
      rfid: 'A1B2C3D4',
      price: 850,
      unit: 'kg',
      category: 'Dry Fruits',
      currentWeight: 45,
      maxWeight: 100,
      lowStockThreshold: 10,
      stockQuantity: 45,
      image: `${BASE_URL}/almonds.png`,
      description: 'California almonds, crispy and high in protein.',
      location: mainWarehouse._id,
    },
    {
      name: 'Roasted Cashews (Kaju)',
      rfid: 'E5F6G7H8',
      price: 950,
      unit: 'kg',
      category: 'Dry Fruits',
      currentWeight: 8,
      maxWeight: 50,
      lowStockThreshold: 5,
      stockQuantity: 8,
      image: `${BASE_URL}/cashews.png`,
      description: 'Whole jumbo cashews, perfectly roasted.',
      location: mainWarehouse._id,
    },
    {
      name: 'Salted Pistachios',
      rfid: 'I9J0K1L2',
      price: 1150,
      unit: 'kg',
      category: 'Dry Fruits',
      currentWeight: 12,
      maxWeight: 50,
      lowStockThreshold: 5,
      stockQuantity: 12,
      image: `https://images.unsplash.com/photo-1610443906660-f655ae2499fc?auto=format&fit=crop&q=80&w=800`,
      description: 'Crunchy salted pistachios in shell.',
      location: branchStore._id,
    },
    {
      name: 'Walnut Halves',
      rfid: 'M3N4O5P6',
      price: 1250,
      unit: 'kg',
      category: 'Dry Fruits',
      currentWeight: 20,
      maxWeight: 60,
      lowStockThreshold: 8,
      stockQuantity: 20,
      image: `https://images.unsplash.com/photo-1543207064-477041796be5?auto=format&fit=crop&q=80&w=800`,
      description: 'Premium Chilean walnut halves.',
      location: branchStore._id,
    },
    {
      name: 'Dried Figs (Anjeer)',
      rfid: 'Q7R8S9T0',
      price: 980,
      unit: 'kg',
      category: 'Dry Fruits',
      currentWeight: 15,
      maxWeight: 40,
      lowStockThreshold: 5,
      stockQuantity: 15,
      image: `https://images.unsplash.com/photo-1596560699310-859424843254?auto=format&fit=crop&q=80&w=800`,
      description: 'Sweet and nutritious dried Afghan figs.',
      location: mainWarehouse._id,
    },
    {
      name: 'Raw Turmeric Root',
      rfid: 'U1V2W3X4',
      price: 180,
      unit: 'kg',
      category: 'Raw Herbs',
      currentWeight: 30,
      maxWeight: 100,
      lowStockThreshold: 10,
      stockQuantity: 30,
      image: `https://images.unsplash.com/photo-1615485245474-368d1f705e4b?auto=format&fit=crop&q=80&w=800`,
      description: 'Fresh organic turmeric roots.',
      location: mainWarehouse._id,
    },
    {
      name: 'Ashwagandha Root',
      rfid: 'Y5Z6A7B8',
      price: 450,
      unit: 'kg',
      category: 'Raw Herbs',
      currentWeight: 5,
      maxWeight: 30,
      lowStockThreshold: 3,
      stockQuantity: 5,
      image: `https://images.unsplash.com/photo-1628551406833-2868ef61a868?auto=format&fit=crop&q=80&w=800`,
      description: 'Dried Ashwagandha roots for wellness.',
      location: branchStore._id,
    },
    {
      name: 'Premium Saffron',
      rfid: 'C9D0E1F2',
      price: 350,
      unit: 'g',
      category: 'Exotic Spices',
      currentWeight: 2,
      maxWeight: 10,
      lowStockThreshold: 1,
      stockQuantity: 2,
      image: `https://images.unsplash.com/photo-1628551406803-3ca2052f5596?auto=format&fit=crop&q=80&w=800`,
      description: 'Grade A Kashmiri Kesar strands.',
      location: mainWarehouse._id,
    },
    {
      name: 'Green Cardamom',
      rfid: 'G3H4I5J6',
      price: 2400,
      unit: 'kg',
      category: 'Exotic Spices',
      currentWeight: 10,
      maxWeight: 50,
      lowStockThreshold: 5,
      stockQuantity: 10,
      image: `https://images.unsplash.com/photo-1628551406815-1888998066ed?auto=format&fit=crop&q=80&w=800`,
      description: 'Fresh aromatic 8mm green cardamom pods.',
      location: branchStore._id,
    },
    {
      name: 'Star Anise',
      rfid: 'K7L8M9N0',
      price: 850,
      unit: 'kg',
      category: 'Exotic Spices',
      currentWeight: 18,
      maxWeight: 40,
      lowStockThreshold: 5,
      stockQuantity: 18,
      image: `https://images.unsplash.com/photo-1628551406812-70678d592931?auto=format&fit=crop&q=80&w=800`,
      description: 'Whole star anise for culinary use.',
      location: mainWarehouse._id,
    },
  ];

  const products = await Product.insertMany(PRODUCTS);
  console.log(`✅ ${products.length} niche products created`);

  // ─── Sample Notifications ──────────────────────────────────────────────
  const lowStockProducts = products.filter((p) => p.currentWeight <= p.lowStockThreshold);
  for (const p of lowStockProducts) {
    await Notification.create({
      type: 'low_stock',
      title: `Low Stock: ${p.name}`,
      message: `${p.name} is at ${p.currentWeight} ${p.unit} (threshold: ${p.lowStockThreshold})`,
      product: p._id,
      location: p.location,
    });
  }
  console.log(`✅ ${lowStockProducts.length} low-stock notifications created`);

  // ─── Transactions ──────────────────────────────────────────────────────
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const PAY_METHODS = ['cash', 'card', 'upi'];

  for (let i = 0; i < 50; i++) {
    const p = pick(products);
    const qty = parseFloat((Math.random() * 2 + 0.2).toFixed(2));
    const total = parseFloat((p.price * qty).toFixed(2));

    await Transaction.create({
      items: [
        {
          product: p._id,
          productName: p.name,
          rfid: p.rfid,
          quantity: qty,
          unit: p.unit,
          pricePerUnit: p.price,
          subtotal: total,
        },
      ],
      totalAmount: total,
      finalAmount: total,
      paymentMethod: pick(PAY_METHODS),
      status: 'completed',
      createdBy: admin._id,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    });
  }
  console.log('✅ 50 sample transactions seeded');

  console.log('\n📊 Niche Seed complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
