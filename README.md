# ⚡ Stockpulse
### **Reactive Commerce Advisor & Autonomous Merchandising Engine**

An event-driven, agentic decision system designed to monitor inventory velocity, orchestrate dynamic pricing adjustments, and automate reorder pipelines with human-in-the-loop oversight.

---

## 🌟 Executive Summary

**Stockpulse** bridges the gap between raw inventory metrics and intelligent merchandising execution. By operating an asynchronous, event-driven recommendation engine, Stockpulse continuously analyzes sales telemetry and stock movements to queue high-precision pricing and stock replenishment recommendations.

Engineered with total operational resilience in mind, the platform decouples heavy decision logic from the core API, ensuring sub-millisecond HTTP responsiveness while maintaining sophisticated algorithmic oversight.

---

## 🏛️ Architectural Foundations

```text
    [ Commerce Signals ] ──────► ( Order / Inventory Event )
                                            │
                                            ▼
                                [ Asynchronous Agentic Loop ]
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
    ┌──────────────────────┐                                 ┌──────────────────────┐
    │  Deterministic Engine │ ◄─────── [ Fallback ] ───────── │   LLM Inference AI   │
    └──────────┬───────────┘                                 └──────────────────────┘
               │
               ▼
    [ Merchandiser Queue ] ──────► ( Accept / Reject ) ──────► [ Database State Update ]
```

* ⚡ **Ultra-Low Latency Execution:** All signal evaluation runs out-of-band in an event-driven background processor, keeping primary user interactions lightning-fast.
* 🛡️ **Zero-Downtime Fallback Architecture:** Features dynamic strategy degradation—if AI APIs experience latency or rate limits, the system seamlessly shifts to deterministic rule sets without service interruption.
* 🎯 **Reorder & Pricing Deduplication:** Built-in state control prevents prompt-flooding and recommendation duplication across overlapping transaction windows.
* 🔒 **Strict State Machines:** Guarantees absolute data integrity across all recommendation lifecycles (`PENDING` → `ACCEPTED`/`REJECTED`) via validated domain models.

---

## 🔍 Deep-Dive Core Tasks

### **Task 1 — Domain Modeling, State Machines & API Architecture**
The foundational layer establishes the core data contracts and operational boundaries for the entire platform.

* **Domain Schema & Data Models:** Implements strongly-typed representations for `Product`, `Order`, `PricingSuggestion`, and `ReorderSuggestion`. Tracks critical velocity signals including `demandVelocity`, `stockLevel`, `reorderThreshold`, and `targetStock`.
* **State Machine Governance:** Enforces rigid lifecycle control via `ProductStateMachine` and `SuggestionStateMachine`. Transitions are strictly unidirectional (`PENDING` → `ACCEPTED` or `REJECTED`). Attempting invalid state mutations (e.g., modifying a terminal `ACCEPTED` record to `REJECTED`) throws a typed `InvalidStateTransitionError`.
* **REST API & Telemetry Routes:** Exposes clean endpoints for manual stock updates, automated checkout simulations, and recommendation overrides.
* **Deterministic Baseline Data:** Includes seed scripts configured with 8 reference SKUs calibrated to trigger immediate reorder conditions under simulated demand spikes.

---

### **Task 2 — Pluggable Strategy Engine**
Designed using the **Strategy Pattern**, this module abstracts decision-making logic away from the core event processors, enabling hot-swapping between recommendation algorithms.

* **Unified Strategy Contract:** Defines a standardized `CommerceStrategy` interface that all algorithmic models must satisfy, taking raw telemetry input and returning structured pricing and reorder objects.
* **Deterministic Rule-Based Advisor:** Serves as the primary operational baseline. Evaluates inventory thresholds against fixed mathematical heuristics:
  * **Low Stock / Velocity Spike:** Calculates optimal margin increases to regulate demand.
  * **Overstock / Stagnant Velocity:** Calculates markdown rates to increase inventory turnover.
  * **Reorder Point Reached:** Generates replenishment orders sized to restore inventory back to `targetStock`.
* **Hot-Swappable Runtime:** Allows system administrators to toggle active strategies at runtime without process restarts or service downtime.

---

### **Task 3 — Fault-Tolerant AI Commerce Advisor**
Enhances decision quality by integrating LLM reasoning for nuanced, multi-factor market analysis, fortified with graceful degradation primitives.

* **Structured GenAI Prompts:** Uses `@google/genai` to pass structured JSON prompts containing product context, historical velocity, current margins, and stock status to Gemini.
* **Strict JSON Response Parsing:** Enforces typed Zod schema parsing on model outputs to guarantee that confidence scores, pricing numbers, and textual justifications conform to database expectations.
* **Self-Healing Fallback Mechanism:** Features automatic error boundaries. If the Gemini API returns a rate-limit error, network timeout, invalid JSON, or missing API key, the service silently falls back to the **Task 2 Rule-Based Engine**.
* **Zero System Impact:** Ensures end-users and background queues never encounter unhandled exceptions due to third-party AI unavailability.

---

### **Task 4 — Asynchronous Agentic Recommendation Loop**
The core orchestrator that binds incoming telemetry to background strategy execution without blocking the main event loop.

* **Non-Blocking Telemetry Hook:** Intercepts order creation, stock decrements, and inventory additions, firing an asynchronous evaluation event out-of-band.
* **Debouncing & Deduplication:** Prevents duplicate pending suggestions for the same product during rapid, concurrent purchasing sprees by inspecting existing `PENDING` states before enqueueing new tasks.
* **Background Worker Queue:** Executes the active strategy (Task 2 or Task 3) asynchronously, creating pending records for merchandisers to review.
* **Human-in-the-Loop Resolution:** When a merchant accepts a pricing or reorder recommendation, the engine updates product lifecycle states, adjusts live pricing, and enqueues replenishment orders in a single atomic database transaction.

---

## 🛠️ Technology Stack

* **Core Runtime:** Node.js, TypeScript (ES Modules)
* **Application Framework:** Express.js
* **Data Access & ORM:** PostgreSQL, Prisma ORM
* **Artificial Intelligence:** `@google/genai` (Gemini API Engine)
