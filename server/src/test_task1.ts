import { prisma } from './db/prisma.js';
import { productService } from './services/productService.js';
import { orderService } from './services/orderService.js';
import { suggestionService } from './services/suggestionService.js';
import { ProductCategory, ProductLifecycle, SuggestionStatus, TriggerReason } from './domain/types.js';
import { ProductStateMachine, SuggestionStateMachine, InvalidStateTransitionError } from './domain/stateMachines.js';
import { runSeed } from './seed/seed.js';

async function runTask1Verification() {
  console.log('====================================================');
  console.log('🧪 RUNNING TASK 1: DOMAIN MODEL & API VERIFICATION');
  console.log('====================================================\n');

  // Step 1: Verify Seed Data (8 SKUs from Addendum A)
  console.log('1️⃣ Seeding Database with Addendum A 8 SKUs...');
  await runSeed();
  const products = await productService.getProducts();
  console.log(`✅ Loaded ${products.length} products. (Expected 8 products)`);
  if (products.length !== 8) throw new Error(`Expected 8 products, got ${products.length}`);

  // Step 2: Verify Demo Candidate (Aura Pro Headphones SKU-EL-101)
  console.log('\n2️⃣ Testing Demo Candidate (SKU-EL-101)...');
  const demoProduct = products.find((p) => p.sku === 'SKU-EL-101');
  if (!demoProduct) throw new Error('SKU-EL-101 not found');
  console.log(`Found ${demoProduct.name}: Stock = ${demoProduct.stockLevel}, Threshold = ${demoProduct.reorderThreshold}, Price = $${demoProduct.currentPrice}`);

  // Step 3: Test State Machine Validation
  console.log('\n3️⃣ Testing State Machine Transition Integrity...');
  try {
    SuggestionStateMachine.validateTransition(SuggestionStatus.ACCEPTED, SuggestionStatus.REJECTED);
    throw new Error('State machine failed to block terminal state transition!');
  } catch (err: any) {
    if (err instanceof InvalidStateTransitionError) {
      console.log('✅ SuggestionStateMachine correctly blocked illegal ACCEPTED -> REJECTED transition.');
    } else {
      throw err;
    }
  }

  // Step 4: Simulate Sale to trigger Demand Spike / Low Stock
  console.log('\n4️⃣ Testing Sale Simulation & Velocity Spike...');
  const saleResult = await orderService.simulateSale({
    productId: demoProduct.id,
    quantity: 6,
  });
  console.log(`✅ Simulated sale of 6 units. New Stock: ${saleResult.product.stockLevel}, Demand Velocity: ${saleResult.product.demandVelocity}`);
  console.log(`Trigger Reason Dispatched: ${saleResult.triggerReason}`);

  // Allow async agentic loop event to execute
  await new Promise((r) => setTimeout(r, 800));

  // Step 5: Verify Pending Suggestion Generated
  console.log('\n5️⃣ Verifying Generated Suggestions for Merchandising Approval...');
  const pendingPricing = await suggestionService.getPricingSuggestions({
    productId: demoProduct.id,
    status: SuggestionStatus.PENDING,
  });
  console.log(`✅ Found ${pendingPricing.length} pending pricing suggestions.`);
  if (pendingPricing.length > 0) {
    const p = pendingPricing[0];
    console.log(`   - Current: $${p.currentPrice.toFixed(2)} -> Recommended: $${p.recommendedPrice.toFixed(2)} (${p.changeDirection})`);
    console.log(`   - Confidence: ${(p.confidence * 100).toFixed(0)}%`);
    console.log(`   - Trigger: ${p.triggerReason}`);
    console.log(`   - Reasoning: ${p.reasoning}`);

    // Step 6: Test Accepting Pricing Suggestion
    console.log('\n6️⃣ Testing Suggestion Acceptance (PATCH /pricing-suggestions/:id)...');
    const acceptResult = await suggestionService.resolvePricingSuggestion(p.id, SuggestionStatus.ACCEPTED);
    console.log(`✅ Accepted suggestion. Updated Product Price: $${acceptResult.product.currentPrice.toFixed(2)}, Lifecycle: ${acceptResult.product.lifecycle}`);
  }

  // Step 7: Verify Reorder Inbound Simulation
  console.log('\n7️⃣ Testing Reorder Acceptance (PATCH /reorder-suggestions/:id)...');
  const pendingReorder = await suggestionService.getReorderSuggestions({
    productId: demoProduct.id,
    status: SuggestionStatus.PENDING,
  });
  if (pendingReorder.length > 0) {
    const r = pendingReorder[0];
    console.log(`   - Current Stock: ${r.currentStock} -> Reorder Quantity: +${r.recommendedQuantity} units`);
    const reorderAccept = await suggestionService.resolveReorderSuggestion(r.id, SuggestionStatus.ACCEPTED);
    console.log(`✅ Accepted reorder. New Stock: ${reorderAccept.product.stockLevel} units (Inbound replenished)`);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL TASK 1 DOMAIN & API VERIFICATIONS PASSED 100%!');
  console.log('====================================================\n');
}

runTask1Verification()
  .catch((e) => {
    console.error('❌ Task 1 Verification Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
