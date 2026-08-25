Stockpulse — Reactive Commerce Advisor
=====================================

Brief overview
--------------
Stockpulse is a small, focused system that watches product inventory and sales signals and suggests two things to merchandisers: what price to set, and when/how much to reorder. The important part is the "agentic loop": an event (sale/stock change) triggers reasoning (rule-based or AI), then the system queues suggestions for a human to accept or reject.

A short story (why things are arranged this way)
-----------------------------------------------
Imagine a merchandiser who gets paged at 3am: an item is almost sold out. You don't want the website to hang while an AI thinks — you want a quick, sensible suggestion and a human in the loop. In the test case included here, some flows can race (sales and evaluations overlap), model calls can fail, and recommendations can repeat. To make the system reliable for demoing and evaluation, the repository seeds a small catalog, runs simple deterministic rule-based fallbacks, queues suggestions asynchronously, and deduplicates repeating prompts. The testTask script arranges steps to exercise these weak spots: seed, simulate a spike, wait for the async loop, then accept suggestions — showing the system end-to-end while keeping execution predictable for demos.

What each core task (T-1 to T-4) does — short, plain language
---------------------------------------------------------------
T-1 — Domain model & API
- What: Defines product and suggestion shapes (what fields matter) and exposes endpoints to create products, change stock, simulate sales, and accept/reject suggestions.
- Why it matters: Merchandisers need predictable data and endpoints to interact with the loop.
- In this test: the seed creates a demo product near its reorder threshold so the agentic loop can be shown with a single simulated sale.

T-2 — Pluggable commerce engine
- What: A strategy system that can swap between a simple rule-based advisor and an AI advisor at runtime (no restart needed).
- Why it matters: Lets you start with safe deterministic logic, then flip to experiments later.
- In this test: the rule-based strategy is the reliable fallback exercised by the verification script.

T-3 — AI commerce advisor (with fallbacks)
- What: An optional AI strategy that calls an LLM for pricing and reorder suggestions, but falls back to deterministic logic if the API is missing or fails.
- Why it matters: Real AI is helpful but brittle; this design keeps the system useful if the model fails or is slow.
- In this test: the AI path is simulated when no API key is present so demos remain reproducible.

T-4 — Agentic recommendation loop
- What: The background process that watches stock and velocity signals, reasons (via the active strategy), and creates suggestions asynchronously so the main API never blocks.
- Why it matters: Keeps the user experience snappy and ensures suggestions appear in the UI without delaying requests.
- In this test: the loop is dispatched asynchronously after stock updates or simulated orders. The test waits briefly for the background job and checks that suggestions appear.

Quick tech stack
----------------
- Node.js + TypeScript (ESM)
- Express for HTTP API
- Prisma for DB schema and access (Postgres by default)
- @google/genai client (optional) for the Gemini AI strategy
- tsx for local dev runs

Quick run notes (very short)
----------------------------
- Set up DATABASE_URL for Postgres and run: npx prisma generate && npx prisma db push
- Seed sample data: npm run seed
- Run the small verification script: npm run test:task1
- Start server for manual exploration: npm run dev

If you want a shorter walkthrough or a one-page demo script to follow on a 5-minute call, tell me which part you'd like the demo to emphasize (seeding, live strategy flip, or the merch console flow) and I’ll write it as a step-by-step checklist.
