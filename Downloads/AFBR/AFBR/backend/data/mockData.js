// backend/data/mockData.js
import User from '../models/User.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { LoyaltyTier, Promotion } from '../models/Loyalty.js';

/**
 * Seed demo data for quick end-to-end flow.
 * Run via: node scripts/seed.js (see below).
 */

export const seedUsers = async () => {
  const existing = await User.findOne({ email: 'priya.demo@example.com' });
  if (existing) return existing;

  const user = await User.create({
    name: 'Priya Demo',
    email: 'priya.demo@example.com',
    phone: '9999999999',
    loyalty_tier: 'Gold',
    loyalty_points: 120,
    preferred_store_location: 'Store-007',
    preferences: {
      favorite_categories: ['formal-shirt'],
      size: 'M',
      color_preferences: ['blue', 'white']
    }
  });

  return user;
};

export const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) return;

  const products = [
    {
      sku: 'FS123',
      name: 'Azure Formal Shirt',
      description: 'Slim fit, cotton-rich formal shirt ideal for office wear.',
      category: 'formal-shirt',
      subcategory: 'shirts',
      price: 1799,
      discount_percent: 0,
      final_price: 1799,
      attributes: {
        size: ['S', 'M', 'L', 'XL'],
        color: ['Blue'],
        material: 'Cotton blend',
        fit: 'Slim'
      },
      images: [],
      tags: ['formal', 'office', 'azure'],
      in_stock: true
    },
    {
      sku: 'FS456',
      name: 'Classic White Shirt',
      description: 'Classic white cotton shirt, versatile for office and events.',
      category: 'formal-shirt',
      subcategory: 'shirts',
      price: 1599,
      discount_percent: 0,
      final_price: 1599,
      attributes: {
        size: ['S', 'M', 'L', 'XL'],
        color: ['White'],
        material: 'Cotton',
        fit: 'Regular'
      },
      images: [],
      tags: ['formal', 'office', 'white'],
      in_stock: true
    },
    {
      sku: 'CS789',
      name: 'Casual Check Shirt',
      description: 'Comfortable casual check shirt for weekends.',
      category: 'casual-shirt',
      subcategory: 'shirts',
      price: 1299,
      discount_percent: 0,
      final_price: 1299,
      attributes: {
        size: ['M', 'L', 'XL'],
        color: ['Red', 'Black'],
        material: 'Cotton',
        fit: 'Regular'
      },
      images: [],
      tags: ['casual', 'weekend'],
      in_stock: true
    }
  ];

  await Product.insertMany(products);
};

export const seedInventory = async () => {
  const count = await Inventory.countDocuments();
  if (count > 0) return;

  const items = [
    {
      sku: 'FS123',
      location: 'Store-007',
      available_stock: 15,
      reserved_stock: 2
    },
    {
      sku: 'FS456',
      location: 'Store-007',
      available_stock: 8,
      reserved_stock: 1
    },
    {
      sku: 'CS789',
      location: 'Store-007',
      available_stock: 10,
      reserved_stock: 0
    }
  ];

  await Inventory.insertMany(items);
};

export const seedLoyalty = async () => {
  const tiersCount = await LoyaltyTier.countDocuments();
  if (!tiersCount) {
    await LoyaltyTier.insertMany([
      {
        tier_name: 'Bronze',
        min_points_required: 0,
        discount_percent: 0,
        perks: []
      },
      {
        tier_name: 'Silver',
        min_points_required: 100,
        discount_percent: 5,
        perks: ['priority_support']
      },
      {
        tier_name: 'Gold',
        min_points_required: 250,
        discount_percent: 10,
        perks: ['priority_support', 'exclusive_offers']
      },
      {
        tier_name: 'Platinum',
        min_points_required: 500,
        discount_percent: 15,
        perks: ['vip_support', 'exclusive_offers', 'early_access']
      }
    ]);
  }

  const promoCount = await Promotion.countDocuments();
  if (!promoCount) {
    const now = new Date();
    const inOneMonth = new Date();
    inOneMonth.setMonth(now.getMonth() + 1);

    await Promotion.create({
      name: 'Festive Formal Offer',
      description: 'Extra 5% off on formal shirts for Gold & Platinum.',
      discount_percent: 5,
      applicable_tiers: ['Gold', 'Platinum'],
      start_date: now,
      end_date: inOneMonth,
      active: true
    });
  }
};

export const seedAll = async () => {
  const user = await seedUsers();
  await seedProducts();
  await seedInventory();
  await seedLoyalty();
  return user;
};
