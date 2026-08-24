# ToolTwin — Product Requirements Document

## Description

ToolTwin is a pre-execution simulation layer for AI agents using tools. When an AI agent proposes a destructive or high-stakes action (delete a customer, issue a refund, change inventory), ToolTwin intercepts it before execution. It simulates the action against a dependency-aware digital twin of the application state, surfaces downstream consequences, evaluates policies, assesses risk, and recommends safer alternatives — then gates execution on explicit human approval.

The MVP demonstrates this with **Acme Commerce**, a fictional e-commerce company. A commerce operations AI agent proposes actions against Acme's customer database. ToolTwin simulates, visualizes, and gates every action through a multi-role human approval workflow.

This is enterprise AI infrastructure: the architecture separates action proposal, interpretation, world state, dependency graphing, counterfactual simulation, policy evaluation, risk assessment, human decision, execution, and verification into explicit, auditable stages.

## Goals

- **Demonstrate the full ToolTwin pipeline** — interception → simulation → dependency analysis → policy check → risk score → recommendation → human approval → execution → verification → audit — in one spectacular end-to-end workflow.
- **Make AI actions safe by default.** The AI agent proposes; ToolTwin simulates; a human decides. No destructive action executes without explicit approval.
- **Show the dependency graph visually.** Users see exactly what entities are affected and how, not just a text summary.
- **Support multi-role SaaS.** Different people log in as Operator (submits actions), Approver (reviews and decides), and Auditor (reviews history).
- **Prove the architecture is real.** The demo executes approved actions against a real, deterministic mini e-commerce system and verifies the resulting state — no mock facades.

## User Stories

- As an **Operator**, I want to submit an AI-proposed action (like "delete customer CUS-10482") to ToolTwin, so that it can be simulated and reviewed before anything happens.
- As an **Approver**, I want to see a visual consequence graph showing all directly and indirectly affected entities, so I understand the full blast radius before I decide.
- As an **Approver**, I want to see policy violations, risk scores, and safer alternative actions recommended by the system, so I can make an informed decision to approve, modify, or block.
- As an **Approver**, I want to see a before/after state comparison after an action executes, so I can verify the outcome matches expectations.
- As an **Auditor**, I want to review a complete audit log of every proposed action, its simulation result, the human decision, and the execution outcome, so I can demonstrate compliance.

## User Flows

### Primary Flow: Operator submits an AI-proposed action

1. **Operator** opens the Action Console and clicks "New Proposal."
2. The system prompts the LLM (via OpenRouter) with Acme Commerce context and the tool catalog. The LLM proposes an action with reasoning.
3. The proposal appears: `delete_customer(customer_id="CUS-10482")` — _"Customer has been inactive for 5 years."_
4. Operator reviews the proposal and clicks **SIMULATE**.
5. ToolTwin runs the simulation engine:
   - Reads the digital twin (world state snapshot)
   - Traverses the dependency graph from the target entity
   - Evaluates all active policies
   - Computes a risk score
   - Generates alternative actions
6. The simulation result page shows:
   - **Consequence Graph** — visual DAG showing CUS-10482 → 12 historical orders → 12 payment records → 8 support tickets → 3 analytics aggregates
   - **Risk Assessment** — HIGH risk (data loss, compliance impact, analytics corruption)
   - **Policy Violations** — "Data Retention Policy: customer records must be preserved for 7 years after last activity"
   - **Recommendation** — BLOCK. Safer alternative: `anonymize_customer` preserves transactional history while removing PII.
7. Operator clicks **SUBMIT FOR REVIEW**.
8. **Approver** receives notification and opens the review queue.
9. Approver examines the same simulation result, may click **MODIFY** to adjust parameters, or selects the recommended alternative.
10. Approver clicks **APPROVE & EXECUTE**.
11. ToolTwin executes the action against the Acme Commerce demo service.
12. ToolTwin reads back the new state and displays a before/after diff.
13. The entire interaction is written to the audit log.

### Alternate Flow: Approver blocks

Same as above through step 9, but Approver clicks **BLOCK**. The action is logged as blocked. No execution occurs.

### Alternate Flow: Direct approval (low risk)

If simulation returns LOW risk with no policy violations, the system may allow the Operator to self-approve (configurable policy).

## Design & UX

### Pages

| Page                  | Purpose                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Login / Signup**    | Supabase Auth. Role assigned at registration.                                                                                 |
| **Dashboard**         | Overview: pending actions count, recent decisions, risk heatmap, audit summary.                                               |
| **Action Console**    | Operator workspace. Trigger LLM proposals, view proposal history, submit for review.                                          |
| **Simulation Detail** | The heart of the product. Consequence graph visualization, risk score, policy violations, recommendations, decision controls. |
| **Review Queue**      | Approver workspace. List of actions awaiting decision, filterable by risk level.                                              |
| **Audit Log**         | Auditor workspace. Full history with filters, export.                                                                         |
| **Policy Manager**    | Define and manage business policies (retention, compliance, thresholds).                                                      |
| **Tool Catalog**      | View available tools, their schemas, and dependency mappings.                                                                 |

### Key Components

- **Consequence Graph** — Interactive DAG visualization using `@xyflow/react`. Nodes are entities (Customer, Order, Payment, etc.). Edges show relationships. Affected nodes highlighted in red/orange/yellow by severity. Click a node to see detail.
- **Risk Gauge** — Visual risk meter (LOW / MEDIUM / HIGH / CRITICAL) with contributing factors listed.
- **Policy Violation Banner** — Red banner listing each violated policy with the specific clause.
- **Alternative Actions Panel** — Side panel showing recommended safer actions with rationale.
- **Decision Bar** — Sticky bottom bar with SIMULATE / MODIFY / BLOCK / APPROVE & EXECUTE buttons, gated by role.
- **Before/After Diff** — Side-by-side state comparison after execution.
- **Proposal Card** — Shows the proposed action, reasoning, timestamp, and status badge.
- **Pipeline Progress Tracker** — Visual stepper showing which of the 11 pipeline stages have completed.

## Integrations

### Supabase

- **Purpose:** Auth, database, Edge Functions, secrets storage. The backbone of ToolTwin itself.
- **Status:** ✅ CONNECTED. Supabase project is linked and ready for implementation.
- **Credentials:** Managed by the platform connection. No manual key handling needed for Supabase itself.

### OpenRouter (LLM Gateway)

- **Purpose:** Powers the AI agent that proposes actions. ToolTwin sends the Acme Commerce tool catalog + context to OpenRouter; the LLM returns a structured tool call proposal.
- **Credentials:**
  - `OPENROUTER_API_KEY` — **SECRET** (Supabase Secret Manager, read only inside Edge Functions). Never exposed to the browser.
- **Where code runs:** Server-side only (Supabase Edge Function `agent-proxy`). The browser calls the Edge Function; the Edge Function calls OpenRouter. The API key never reaches the client.
- **Transport:** REST (POST `https://openrouter.ai/api/v1/chat/completions`) with tool calling (`tools` parameter) + structured outputs (`response_format: { type: "json_schema" }`). Non-streaming for the MVP.
- **SDK/package:** `fetch` (standard Web API) — the OpenRouter API is OpenAI-compatible. No SDK dependency needed. The Edge Function constructs requests with `Authorization: Bearer <key>`, `HTTP-Referer`, and `X-OpenRouter-Title` headers.
- **Constraint:** The LLM may ONLY propose actions from the predefined ToolTwin tool catalog. The system prompt + tool definitions enforce this. The LLM never directly executes tools — it only returns tool call JSON that ToolTwin intercepts.
- **Constraint:** The model is configurable via a database setting. Default: `openai/gpt-4o`. Changing the model does not require changing the ToolTwin action interface.

### Acme Commerce Demo Service

- **Purpose:** A deterministic mini e-commerce system that serves as the "real" external service ToolTwin protects. Approved actions execute here. ToolTwin reads state back for verification.
- **Architecture:** Lives in a dedicated `acme` schema within the same Supabase project. ToolTwin treats it as an external REST API via Edge Functions regardless of physical co-location.
- **Entities:** Customers, Orders, Payments, Inventory Items, Support Tickets, Analytics Aggregates.
- **Credentials:** Service-to-service. The Acme Commerce Edge Functions accept an internal service token (Supabase service role). No user-facing credentials needed.
- **Transport:** REST. ToolTwin calls Acme Commerce endpoints to read state (for the digital twin), execute approved actions, and read back verification state.
- **Constraint:** All Acme Commerce endpoints must be deterministic — given the same inputs, they produce the same outputs. This ensures simulation and verification are reliable.
- **Constraint:** Acme Commerce runs with a seeded dataset of ~50 customers, ~200 orders, etc., designed to create interesting dependency scenarios for the demo.

## Architecture

### Edge Functions (Consolidated)

To stay within Supabase free tier limits and because several pipeline stages always run together, the 11 stages are consolidated into 3 Edge Functions:

| Function              | Stages                                        | Purpose                                                                                                                                                                      |
| --------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`agent-proxy`**     | Stage 1 (Agent Action Proposal)               | Receives tool catalog + context from client, calls OpenRouter, returns structured tool call proposal                                                                         |
| **`pipeline-engine`** | Stages 2-7 (Interpretation → Risk Assessment) | Parses tool call, snapshots world state, traverses dependency graph, simulates, evaluates policies, computes risk, generates alternatives. Single invocation per simulation. |
| **`executor`**        | Stages 8-11 (Decision → Audit Log)            | Receives approved action, executes against Acme Commerce, verifies post-execution state, writes audit log                                                                    |

### 11-Stage Pipeline

ToolTwin's architecture is explicitly separated into 11 stages. Each stage is an independent, auditable, testable unit:

```
1. AGENT ACTION PROPOSAL        [agent-proxy]
   Operator triggers → Edge Function calls OpenRouter with tool catalog → LLM returns structured tool call proposal

2. TOOL/ACTION INTERPRETATION   [pipeline-engine]
   Parse the proposed tool call → Validate it's in the catalog → Extract target entity, action type, parameters

3. WORLD STATE (DIGITAL TWIN)   [pipeline-engine]
   Snapshot the current state of all relevant Acme Commerce entities → Store as immutable snapshot for audit

4. DEPENDENCY GRAPH             [pipeline-engine]
   From the target entity, traverse the dependency graph → Identify all directly and indirectly affected entities

5. COUNTERFACTUAL SIMULATION    [pipeline-engine]
   Apply the proposed action to the world state snapshot → Compute the resulting state → Identify cascading effects

6. POLICY EVALUATION            [pipeline-engine]
   Check the proposed action + simulated result against all active policies → Return violations with specific policy references

7. RISK ASSESSMENT              [pipeline-engine]
   Compute risk score from: blast radius size, entity types affected, policy violations, data loss potential, reversibility

8. HUMAN DECISION               [executor]
   Present simulation results to Approver → Approver chooses: APPROVE, BLOCK, or MODIFY (select alternative or adjust parameters)

9. EXECUTION                    [executor]
   If approved → Call Acme Commerce service with the approved action → Capture response

10. VERIFICATION                [executor]
    Read post-execution state from Acme Commerce → Compare to simulated prediction → Flag discrepancies

11. AUDIT LOG                   [executor]
    Write immutable record: proposal, snapshot, simulation, policy results, risk, decision, execution result, verification diff
```

### State Machine

Every action proposal moves through a strict state machine:

```
PROPOSED → SIMULATING → SIMULATED → PENDING_REVIEW → (APPROVED | BLOCKED | MODIFIED)
                                                           ↓
APPROVED → EXECUTING → EXECUTED → VERIFYING → (VERIFIED | DISCREPANCY)
```

- **PROPOSED:** LLM has generated a proposal. Not yet simulated.
- **SIMULATING:** Simulation engine is running.
- **SIMULATED:** Simulation complete. Results available. Awaiting operator decision to submit.
- **PENDING_REVIEW:** Submitted for Approver review.
- **APPROVED:** Approver authorized execution.
- **BLOCKED:** Approver denied. Terminal state.
- **MODIFIED:** Approver chose an alternative action or adjusted parameters. Loops back to SIMULATING with the new action.
- **EXECUTING:** Action is being sent to Acme Commerce.
- **EXECUTED:** Action completed. Awaiting verification.
- **VERIFYING:** Reading back state and comparing.
- **VERIFIED:** Post-execution state matches simulation. Terminal success state.
- **DISCREPANCY:** Post-execution state diverged from simulation. Flagged for investigation.

### Data Model

#### Core Tables (ToolTwin — `public` schema)

```sql
-- Each proposed action
action_proposals (
  id            uuid PRIMARY KEY,
  status        enum('PROPOSED','SIMULATING','SIMULATED','PENDING_REVIEW',
                     'APPROVED','BLOCKED','MODIFIED','EXECUTING',
                     'EXECUTED','VERIFYING','VERIFIED','DISCREPANCY'),
  proposed_by   uuid REFERENCES users(id),       -- Operator
  reviewed_by   uuid REFERENCES users(id),        -- Approver (nullable)
  tool_name     text NOT NULL,                     -- e.g. 'delete_customer'
  tool_params   jsonb NOT NULL,                    -- e.g. {"customer_id": "CUS-10482"}
  llm_reasoning text,                              -- Why the LLM proposed this
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Immutable snapshot of world state at simulation time
world_snapshots (
  id            uuid PRIMARY KEY,
  proposal_id   uuid REFERENCES action_proposals(id),
  snapshot_data jsonb NOT NULL,                    -- Full state of affected entities
  created_at    timestamptz DEFAULT now()
);

-- Simulation results (includes alternatives as JSONB)
simulation_results (
  id                  uuid PRIMARY KEY,
  proposal_id         uuid REFERENCES action_proposals(id),
  snapshot_id         uuid REFERENCES world_snapshots(id),
  affected_entities   jsonb NOT NULL,              -- [{entity_type, entity_id, relationship, impact_severity}]
  dependency_graph    jsonb NOT NULL,              -- Nodes + edges for visualization
  risk_score          integer NOT NULL,            -- 0-100
  risk_level          enum('LOW','MEDIUM','HIGH','CRITICAL'),
  risk_factors        jsonb,                       -- [{factor, weight, description}]
  simulated_state     jsonb,                       -- Predicted post-execution state
  policy_violations   jsonb NOT NULL,              -- [{policy_id, policy_name, clause, severity}]
  policy_passed       boolean NOT NULL,
  alternatives        jsonb,                       -- [{tool_name, tool_params, rationale, predicted_risk, rank}]
  created_at          timestamptz DEFAULT now()
);

-- Execution results
execution_results (
  id                  uuid PRIMARY KEY,
  proposal_id         uuid REFERENCES action_proposals(id),
  executed_action     jsonb NOT NULL,              -- What was actually sent
  response            jsonb,                       -- Acme Commerce response
  pre_state           jsonb,                       -- State before execution
  post_state          jsonb,                       -- State after execution
  verification_status enum('PENDING','VERIFIED','DISCREPANCY'),
  discrepancy_detail  jsonb,                       -- If mismatch, what differed
  executed_at         timestamptz DEFAULT now()
);

-- Business policies
policies (
  id            uuid PRIMARY KEY,
  name          text NOT NULL,
  description   text,
  rule_type     text NOT NULL,                     -- e.g. 'retention', 'compliance', 'threshold'
  rule_config   jsonb NOT NULL,                    -- Machine-evaluable rule definition
  severity      enum('LOW','MEDIUM','HIGH','CRITICAL'),
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- Tool catalog
tools (
  id              uuid PRIMARY KEY,
  name            text UNIQUE NOT NULL,
  description     text,
  parameters      jsonb NOT NULL,                  -- JSON Schema for parameters
  target_entity   text,                            -- Primary entity type this tool affects
  is_destructive  boolean DEFAULT false,
  dependencies    jsonb,                           -- [{entity_type, relationship}]
  created_at      timestamptz DEFAULT now()
);

-- Dependency graph edges (DB-backed, editable at runtime)
dependency_edges (
  id                uuid PRIMARY KEY,
  source_entity     text NOT NULL,                 -- e.g. 'customers'
  source_field      text NOT NULL,                 -- e.g. 'id'
  target_entity     text NOT NULL,                 -- e.g. 'orders'
  target_field      text NOT NULL,                 -- e.g. 'customer_id'
  relationship_type text NOT NULL,                 -- e.g. 'one_to_many', 'cascade'
  created_at        timestamptz DEFAULT now()
);

-- Audit log (immutable, append-only)
audit_log (
  id            uuid PRIMARY KEY,
  proposal_id   uuid REFERENCES action_proposals(id),
  event_type    text NOT NULL,                     -- 'PROPOSED', 'SIMULATED', 'APPROVED', 'EXECUTED', etc.
  event_data    jsonb NOT NULL,
  actor_id      uuid REFERENCES users(id),
  created_at    timestamptz DEFAULT now()
);

-- Users (extends Supabase Auth)
profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id),
  role          enum('operator','approver','auditor','admin'),
  full_name     text,
  created_at    timestamptz DEFAULT now()
);
```

**Note:** `policy_evaluations` and `action_alternatives` are embedded into `simulation_results` as `policy_violations`/`policy_passed` and `alternatives` JSONB columns respectively, since they are always 1:1 with a simulation result.

#### Acme Commerce Tables (`acme` schema)

```sql
-- acme.customers
customers (
  id            text PRIMARY KEY,                  -- e.g. 'CUS-10482'
  name          text NOT NULL,
  email         text,
  phone         text,
  status        text DEFAULT 'active',             -- active, inactive, anonymized
  last_active   timestamptz,
  created_at    timestamptz
);

-- acme.orders
orders (
  id            text PRIMARY KEY,
  customer_id   text REFERENCES customers(id),
  total         numeric,
  status        text,
  created_at    timestamptz
);

-- acme.payments
payments (
  id            text PRIMARY KEY,
  order_id      text REFERENCES orders(id),
  amount        numeric,
  method        text,
  created_at    timestamptz
);

-- acme.inventory
inventory (
  id            text PRIMARY KEY,
  product_name  text,
  quantity      integer,
  reserved      integer,
  updated_at    timestamptz
);

-- acme.support_tickets
support_tickets (
  id            text PRIMARY KEY,
  customer_id   text REFERENCES customers(id),
  status        text,
  priority      text,
  created_at    timestamptz
);

-- acme.analytics
analytics_aggregates (
  id            text PRIMARY KEY,
  metric_name   text,
  dimension     text,                              -- e.g. 'customer_id'
  dimension_value text,
  value         numeric,
  updated_at    timestamptz
);
```

### Dependency Graph

The dependency graph defines how entities relate and what happens when a parent is modified or deleted:

```
Customer (CUS-10482)
├── Order (ORD-0501) ─── Payment (PAY-0501)
├── Order (ORD-0502) ─── Payment (PAY-0502)
├── Order (ORD-0503) ─── Payment (PAY-0503)
├── ... (9 more orders with payments)
├── Support Ticket (TKT-0012)
├── Support Ticket (TKT-0047)
├── ... (6 more tickets)
├── Analytics: customer_ltv aggregate
├── Analytics: churn_cohort aggregate
└── Analytics: revenue_by_customer aggregate

Total blast radius for delete_customer("CUS-10482"):
  - 1 customer record
  - 12 order records (or foreign key violations)
  - 12 payment records (cascading)
  - 8 support tickets (or foreign key violations)
  - 3 analytics aggregates (corrupted)
```

Dependency rules (defined in `dependency_edges` and evaluated at simulation time):

| Source   | Relationship | Target                         | Delete Behavior                     |
| -------- | ------------ | ------------------------------ | ----------------------------------- |
| Customer | one_to_many  | Order                          | CASCADE (or FK violation)           |
| Order    | one_to_many  | Payment                        | CASCADE (or FK violation)           |
| Customer | one_to_many  | Support Ticket                 | CASCADE (or FK violation)           |
| Customer | aggregate    | Analytics: customer_ltv        | CORRUPT                             |
| Customer | aggregate    | Analytics: churn_cohort        | CORRUPT                             |
| Customer | aggregate    | Analytics: revenue_by_customer | CORRUPT                             |
| Order    | aggregate    | Analytics: daily_revenue       | CORRUPT                             |
| Order    | many_to_one  | Inventory                      | SIDE_EFFECT (re-stock if cancelled) |

### Simulation Engine

The simulation engine is the core intellectual property of ToolTwin. It runs entirely server-side as part of the `pipeline-engine` Edge Function.

**Algorithm:**

1. **Load World Snapshot:** Read current state of the target entity and all entities within N hops of the dependency graph.
2. **Apply Proposed Action:** Compute what the state would look like if the action executed. For `delete_customer("CUS-10482")`:
   - Customer record → deleted
   - Orders → deleted (cascade) or orphaned (FK violation)
   - Payments → deleted (cascade from orders) or orphaned
   - Support tickets → deleted (cascade) or orphaned
   - Analytics → recompute aggregates without this customer's data
3. **Classify Each Affected Entity:** For each entity in the blast radius, assign:
   - `impact_type`: DELETED, ORPHANED, CORRUPTED, MODIFIED, CASCADED
   - `severity`: LOW, MEDIUM, HIGH, CRITICAL
   - `reversibility`: REVERSIBLE, PARTIALLY_REVERSIBLE, IRREVERSIBLE
4. **Generate Dependency Graph JSON:** Nodes + edges for visualization.
5. **Return Simulation Result.**

The engine does NOT make policy or risk decisions — those are sequential steps within the same Edge Function but logically separate stages. The engine is purely a state-transition predictor.

### Policy System

Policies are declarative rules evaluated against the proposed action and simulation result.

**Policy Schema:**

```json
{
  "name": "Data Retention Policy",
  "rule_type": "retention",
  "rule_config": {
    "entity": "customers",
    "condition": "last_active > now() - interval '7 years' OR has_orders = true",
    "action": "BLOCK",
    "message": "Customer records must be preserved for 7 years after last activity or while historical orders exist."
  },
  "severity": "CRITICAL"
}
```

**MVP Policies (seeded):**

1. **Data Retention Policy** — Block deletion of any customer with activity within 7 years or with existing orders.
2. **Financial Integrity Policy** — Block any action that would delete or corrupt payment records.
3. **Support History Policy** — Warn when deleting entities with open support tickets.
4. **Analytics Integrity Policy** — Warn when actions would corrupt aggregate metrics.
5. **GDPR Compliance Policy** — When blocking deletion, recommend anonymization as alternative.

**Evaluation:** Policies run inside `pipeline-engine` immediately after simulation. The function loads all active policies, evaluates each against the proposed action + simulation result, and returns violations. Policies can return BLOCK (hard stop), WARN (flag but don't block), or RECOMMEND (suggest alternative).

### Risk Assessment

Risk is computed as a weighted score (0-100) from:

| Factor             | Weight | Description                                          |
| ------------------ | ------ | ---------------------------------------------------- |
| Blast radius size  | 25%    | Number of directly + indirectly affected entities    |
| Entity criticality | 25%    | Payment/financial entities weighted higher than logs |
| Policy violations  | 20%    | Count × severity of policy violations                |
| Reversibility      | 20%    | Is the action reversible? Deletes are irreversible   |
| Data sensitivity   | 10%    | Does the entity contain PII or financial data?       |

Risk bands: LOW (0-25), MEDIUM (26-50), HIGH (51-75), CRITICAL (76-100).

### Seeded Demo Scenario

The primary demo scenario walks through deleting an inactive customer:

**Acme Commerce Seed Data for CUS-10482:**

- Customer: Jane Morrison, CUS-10482, last active 2019-03-15 (6 years ago, not 5 — triggers retention policy)
- 12 historical orders totaling $14,230 across 2017-2019
- 12 corresponding payment records
- 8 support tickets (all resolved, 2017-2019)
- Analytics aggregates include her data

**Demo Flow:**

1. Operator triggers LLM proposal. LLM proposes `delete_customer(customer_id="CUS-10482")` with reasoning "Customer has been inactive for over 5 years."
2. Simulation reveals 12 orders, 12 payments, 8 tickets, 3 analytics aggregates affected. Risk: HIGH.
3. Data Retention Policy fires: last activity was 6 years ago (< 7 year threshold) AND customer has orders. BLOCK.
4. GDPR Compliance Policy fires: recommends `anonymize_customer` instead.
5. Approver sees the graph, the violations, and selects the recommended `anonymize_customer` alternative.
6. Approver clicks APPROVE & EXECUTE.
7. `anonymize_customer("CUS-10482")` executes against Acme Commerce: name → "Anonymous User", email → redacted, phone → null, status → "anonymized". Orders/payments/tickets preserved.
8. Verification shows: customer anonymized, all transactional records intact, analytics still coherent.
9. Audit log records everything.

## Acceptance Criteria

1. **Operator can trigger LLM proposal:** Clicking "New Proposal" calls the `agent-proxy` Edge Function, which calls OpenRouter. The LLM returns a valid tool call from the catalog. The proposal appears in the Action Console.
2. **Simulation runs correctly:** For `delete_customer("CUS-10482")`, the simulation identifies at least 30 affected entities across orders, payments, tickets, and analytics.
3. **Consequence graph is interactive:** Users see a visual DAG via `@xyflow/react`. Nodes can be clicked for detail. Affected nodes are color-coded by severity.
4. **Policies evaluate correctly:** Data Retention Policy fires (BLOCK) because CUS-10482 has orders and last activity < 7 years ago. GDPR policy recommends anonymization.
5. **Risk score is HIGH:** The risk assessment returns 51-75 for the delete action.
6. **Alternatives are recommended:** `anonymize_customer` appears as the top recommended alternative with rationale.
7. **Approver can MODIFY:** Selecting the alternative re-simulates with the new action.
8. **Approver can APPROVE & EXECUTE:** The approved action executes against the real Acme Commerce service (via the `executor` Edge Function).
9. **Verification shows before/after diff:** Post-execution, the customer is anonymized, orders are intact.
10. **Audit log is complete:** Every stage transition is recorded with actor, timestamp, and data.
11. **Multi-role works:** Operator cannot approve. Approver cannot propose. Auditor has read-only access.
12. **All 11 pipeline stages are visible** in the UI as a Pipeline Progress Tracker on the Simulation Detail page.

## Out of Scope

- **Real LLM agent autonomy:** The LLM does not autonomously monitor and propose actions. The Operator explicitly triggers each proposal. Continuous/streaming agent loops are post-MVP.
- **Custom policy builder UI:** Policies are seeded via SQL. A visual policy builder is post-MVP.
- **Multi-tenancy:** Single Acme Commerce instance. ToolTwin itself does not need tenant isolation for the MVP.
- **Third-party service integrations beyond OpenRouter:** Only OpenRouter is integrated. No Stripe, Twilio, etc.
- **Email/push notifications:** The review queue is polled, not pushed.
- **SSO / SAML:** Standard Supabase Auth (email/password) only.
- **Horizontal scaling / production infrastructure:** The architecture is designed for it, but the MVP runs on Supabase free tier.

## Open Questions

1. ~~**Graph visualization library:**~~ ✅ Chosen: `@xyflow/react` (formerly React Flow).
2. ~~**Acme Commerce deployment:**~~ ✅ Chosen: Dedicated `acme` schema within the same Supabase project.
3. **OpenRouter model selection:** Default model TBD. `openai/gpt-4o` or `anthropic/claude-sonnet-4` are candidates with strong tool-calling support. The model is configurable and not hardcoded.

## Implementation Notes

- **Supabase is connected.** The project is linked and ready for schema migrations and Edge Function deployment.
- **OpenRouter API key must be collected** via `store_secret_action` with name `OPENROUTER_API_KEY` before the `agent-proxy` Edge Function can be deployed.
- **Package additions expected:** `@supabase/supabase-js`, `react-router-dom`, `@xyflow/react`, `@tanstack/react-query`.
- **3 Edge Functions total:** `agent-proxy` (LLM gateway), `pipeline-engine` (simulation + policy + risk + alternatives), `executor` (execution + verification + audit log). This stays within Supabase free tier limits.
- **The Acme Commerce service** lives in a dedicated `acme` schema within the same project, with its own Edge Functions for state reads/writes. ToolTwin calls these via internal REST, preserving logical separation.
- **Seeding:** A SQL migration should seed: the tool catalog, dependency edges, policies, profiles (test users for each role), and the Acme Commerce demo data (50 customers, ~200 orders, etc.).
- **8 tables in `public` schema** + 6 tables in `acme` schema = 14 tables total across both schemas.
