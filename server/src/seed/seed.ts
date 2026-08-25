import { prisma } from '../db/prisma.js';
import { productService } from '../services/productService.js';
import { SEED_PRODUCTS } from './seedData.js';
import { commerceEngine } from '../engine/commerceEngine.js';

export async function runSeed() {
  console.log('[Seed] Initializing database seed with Addendum A products...');

  await commerceEngine.initialize();

  // Clean existing tables in dependency order
  await prisma.orderLog.deleteMany();
  await prisma.inventorySnapshot.deleteMany();
  await prisma.pricingSuggestion.deleteMany();
  await prisma.reorderSuggestion.deleteMany();
  await prisma.product.deleteMany();

  console.log('[Seed] Cleared existing records.');

  for (const item of SEED_PRODUCTS) {
    const product = await productService.createProduct(item);
    console.log(`[Seed] Created ${product.sku} - ${product.name} (Stock: ${product.stockLevel}/${product.reorderThreshold})`);
  }

  console.log('[Seed] Database seed completed successfully!');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.ts')) {
  runSeed()
    .catch((e) => {
      console.error('[Seed] Error running seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
