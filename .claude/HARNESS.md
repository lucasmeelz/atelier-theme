# Écrin Theme — Build Harness

## Architecture

Inspired by [Anthropic's harness design](https://www.anthropic.com/engineering/harness-design-long-running-apps), this project uses a **3-agent adversarial pattern** for building premium theme sections.

```
┌─────────┐     ┌───────────┐     ┌───────────┐
│ PLANNER │ ──→ │ GENERATOR │ ──→ │ EVALUATOR │
│         │     │           │ ←── │           │
│ Writes  │     │ Builds    │     │ Tests via │
│ specs   │     │ code      │     │ Playwright│
└─────────┘     └───────────┘     └───────────┘
     │                │                  │
     ▼                ▼                  ▼
 .claude/specs/   sections/        .claude/qa/
                  assets/
                  snippets/
```

## Agents

| Agent | File | Role | Key Principle |
|-------|------|------|---------------|
| Planner | `.claude/agents/planner.md` | Spec writer | Ambitious scope, abstract on implementation |
| Generator | (main Claude session) | Code builder | Incremental, self-evaluating |
| Evaluator | `.claude/agents/evaluator.md` | QA tester | Skeptical, detail-obsessed, Playwright-driven |
| Orchestrator | `.claude/agents/build-section.md` | Lifecycle manager | Plan → Build → QA → Fix → Ship |

## Workflow

### To build a new section:

```
"Build the hero section"
```

This triggers:

1. **📋 PLAN** — Planner reads specs + references, outputs acceptance criteria
2. **🔨 BUILD** — Generator implements code, pushes to Shopify
3. **🔍 QA** — Evaluator runs Playwright at 3 viewports, scores 4 dimensions
4. **🔧 FIX** — Generator addresses bugs from QA report (max 3 cycles)
5. **✅ SHIP** — Commit + push when score >= 8.0 with zero P0/P1

### QA Scoring (4 dimensions)

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| Visual Quality | 30% | Layout, typography, spacing, color coherence |
| Interaction Quality | 25% | Animations, hover states, transitions, touch targets |
| Code Quality | 20% | Liquid/CSS/JS patterns, accessibility, performance |
| Completeness | 25% | Acceptance criteria, settings coverage, edge cases |

**Ship threshold**: Overall >= 8.0 AND zero P0/P1 bugs

### QA Tools

- **Playwright**: `node .claude/qa/playwright-runner.js --section={name}`
- **Viewports**: Desktop (1512x800), Tablet (768x1024), Mobile (375x812)
- **Screenshots**: `/tmp/qa/{section}/` directory

## Key Design Decisions

### Why separate Evaluator?
Claude is a poor QA agent of its own work — it identifies issues then justifies dismissing them. A separate evaluator with a skeptical prompt eliminates this bias.

### Why file-based communication?
Agents pass specs and QA reports via files, not direct messages. This creates clear artifacts, enables re-runs, and prevents over-specification.

### Why max 3 fix cycles?
Diminishing returns. If 3 rounds of fixes can't resolve issues, the architecture needs rethinking, not more patches.

### Why Playwright over screenshots?
Interactive testing (clicking, hovering, scrolling, typing) catches bugs that static screenshots miss. Computed style verification ensures pixel-level accuracy.

## Directory Structure

```
.claude/
├── agents/
│   ├── planner.md          # Spec writing agent
│   ├── evaluator.md        # QA testing agent
│   └── build-section.md    # Orchestrator agent
├── specs/
│   └── {section}-spec.md   # Implementation specs (planner output)
├── qa/
│   ├── playwright-runner.js # Reusable test runner
│   └── {section}-qa.md     # QA reports (evaluator output)
└── HARNESS.md              # This file
```
