# AromaHR — Kiro AI System

This directory contains the autonomous coding system for AromaHR, a luxury fragrance e-commerce platform.

## Quick Start

### For Developers
1. Read `SYSTEM.md` for complete overview
2. Review steering files in `steering/` for project context
3. Check agent documentation in `agents/` for specialized help

### For AI Assistants
1. **ALWAYS** load steering files before coding
2. Route tasks to appropriate agents
3. Follow existing patterns strictly
4. Verify quality checklist before completion

## Directory Structure

```
.kiro/
├── SYSTEM.md              # Complete system overview
├── README.md              # This file
├── steering/              # Project context (auto-loaded)
│   ├── product.md         # Business & product context
│   ├── tech.md            # Technology stack
│   ├── structure.md       # Project architecture
│   ├── conventions.md     # Code conventions
│   ├── api.md             # API integration guide
│   └── ui.md              # Design system
└── agents/                # Specialized agents
    ├── frontend-agent.md  # React/TypeScript expert
    ├── backend-agent.md   # Node.js/Express expert
    ├── design-agent.md    # UI/UX expert
    ├── debug-agent.md     # Debugging expert
    └── refactor-agent.md  # Code quality expert
```

## Core Principles

1. **Context First** — Never code without understanding the codebase
2. **Patterns Always** — Follow existing conventions strictly
3. **Quality Over Speed** — Consistency beats creativity
4. **Specialized Agents** — Route tasks to the right expert
5. **Steering as Truth** — Treat steering files as authoritative

## Agent Routing

- **UI/styling** → design-agent
- **React/frontend** → frontend-agent
- **Express/API** → backend-agent
- **Errors/bugs** → debug-agent
- **Cleanup/optimization** → refactor-agent

## Workflow

1. **Requirements** — Clarify task
2. **Context** — Gather information (context-gatherer or manual)
3. **Design** — Plan approach
4. **Implementation** — Code with appropriate agent
5. **Verification** — Test and verify quality

## Key Files

- `SYSTEM.md` — Complete system documentation
- `steering/product.md` — Business context
- `steering/conventions.md` — Code standards
- `steering/ui.md` — Design system
- `agents/frontend-agent.md` — React patterns

## Getting Help

1. Check steering files for context
2. Review agent documentation
3. Follow SYSTEM.md workflow
4. Ask for clarification if unclear

---

**Start with SYSTEM.md for complete documentation.**
