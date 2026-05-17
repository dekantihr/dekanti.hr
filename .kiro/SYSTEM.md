# AromaHR — Autonomous Coding System

## Overview
This is a fully autonomous coding system for the AromaHR luxury fragrance e-commerce platform. The system uses specialized agents, steering files, and automated workflows to maintain architectural consistency and code quality.

## Core Principles

### 1. Context-First Development
**NEVER code before gathering context.**

Before any implementation:
1. Run context-gatherer agent to understand the codebase
2. Read relevant steering files
3. Identify existing patterns and conventions
4. Plan the approach

### 2. Architectural Consistency
**ALWAYS follow existing patterns.**

- Reuse existing components (ProductCard, Navbar, Footer)
- Follow naming conventions (PascalCase, camelCase, UPPER_SNAKE_CASE)
- Use established state management patterns (custom hooks)
- Maintain design system (dark luxury theme)
- Follow TypeScript strict mode

### 3. Specialized Agents
**Automatically route tasks to the right agent.**

- **frontend-agent** → React/TypeScript, components, hooks, routing
- **backend-agent** → Node.js/Express, PostgreSQL, API design
- **design-agent** → UI/UX, Tailwind CSS, styling, animations
- **debug-agent** → Errors, performance issues, troubleshooting
- **refactor-agent** → Code cleanup, optimization, best practices

### 4. Steering Files as Source of Truth
**Load steering files first, treat as authoritative.**

Steering files in `.kiro/steering/`:
- `product.md` — Business context, features, user flows
- `tech.md` — Technology stack, dependencies
- `structure.md` — Project architecture, file organization
- `conventions.md` — Code conventions, best practices
- `api.md` — API endpoints, integration guide
- `ui.md` — Design system, component patterns

### 5. Quality Over Speed
**Prefer consistency over creativity.**

- Follow established patterns
- Reuse components when possible
- Maintain type safety
- Ensure accessibility
- Test thoroughly

## Workflow

**CRITICAL: AI assistants MUST explicitly announce each step before executing.**

### Phase 1: Requirements Analysis
**ANNOUNCE:**
```
📋 ANALYZING REQUIREMENTS
- Task: [describe task]
- Affected areas: [frontend/backend/design/etc]
- Agent selection: [which agent(s) to use]
```

### Phase 2: Context Gathering
**ANNOUNCE:**
```
📚 LOADING CONTEXT
- Reading steering files: [list files being read]
- Checking existing patterns: [what patterns found]
- Identifying reusable components: [list components]
- Running context-gatherer: [yes/no, why]
```

**THEN:** Actually read the files and show key findings

### Phase 3: Agent Activation
**ANNOUNCE:**
```
🤖 ACTIVATING AGENT: [agent-name]
- Reason: [why this agent]
- Expertise needed: [specific skills]
- Patterns to follow: [which patterns from steering files]
```

### Phase 4: Design Planning
**ANNOUNCE:**
```
🎨 DESIGN PLAN
- Component structure: [outline]
- Types/interfaces: [list]
- State management: [approach]
- Reusing: [existing components/patterns]
```

### Phase 5: Implementation
**ANNOUNCE:**
```
⚙️ IMPLEMENTING
- Following pattern: [specific pattern from steering]
- Using conventions from: [which steering file]
- Maintaining: [type safety/accessibility/etc]
```

**THEN:** Write the code

### Phase 6: Verification
**ANNOUNCE:**
```
✅ VERIFICATION
- Build status: [checking...]
- Design consistency: [verified against ui.md]
- Accessibility: [checked]
- Pattern adherence: [confirmed]
```

## Agent Routing Rules

### Automatic Routing
```
UI/styling keywords → design-agent
  - "style", "color", "layout", "responsive", "animation"

React/frontend keywords → frontend-agent
  - "component", "hook", "state", "props", "routing"

Express/API keywords → backend-agent
  - "endpoint", "database", "query", "authentication", "migration"

Error keywords → debug-agent
  - "error", "bug", "not working", "broken", "fix"

Cleanup keywords → refactor-agent
  - "refactor", "optimize", "cleanup", "improve", "simplify"
```

### Manual Routing
User can explicitly request an agent:
- "Use design-agent to style this component"
- "Ask backend-agent to create this endpoint"
- "Have refactor-agent optimize this code"

## File Structure

```
.kiro/
├── SYSTEM.md              # This file — system overview
├── steering/              # Context & guidelines (auto-loaded)
│   ├── product.md         # Business context
│   ├── tech.md            # Technology stack
│   ├── structure.md       # Project architecture
│   ├── conventions.md     # Code conventions
│   ├── api.md             # API integration
│   └── ui.md              # Design system
└── agents/                # Specialized agents
    ├── frontend-agent.md  # React/TypeScript expert
    ├── backend-agent.md   # Node.js/Express expert
    ├── design-agent.md    # UI/UX expert
    ├── debug-agent.md     # Debugging expert
    └── refactor-agent.md  # Code quality expert
```

## Behavior Rules

### DO
✅ Read context before coding
✅ Follow existing patterns
✅ Reuse components when possible
✅ Maintain type safety
✅ Ensure accessibility
✅ Use steering files as source of truth
✅ Route to appropriate agent
✅ Test after implementation
✅ Maintain design consistency

### DON'T
❌ Code without understanding context
❌ Break architectural patterns
❌ Create duplicate components
❌ Use 'any' types
❌ Ignore accessibility
❌ Deviate from design system
❌ Skip validation
❌ Leave errors unhandled

## Code Quality Checklist

### Before Implementation
- [ ] Context gathered (context-gatherer or manual review)
- [ ] Steering files read
- [ ] Existing patterns identified
- [ ] Reusable components checked
- [ ] Agent selected

### During Implementation
- [ ] TypeScript types defined
- [ ] Props interfaces documented
- [ ] Handlers use useCallback
- [ ] localStorage wrapped in try-catch
- [ ] Tailwind classes organized
- [ ] Accessibility attributes added
- [ ] Images have alt text
- [ ] Forms have validation

### After Implementation
- [ ] Build passes (no TypeScript errors)
- [ ] Functionality tested
- [ ] Design consistency verified
- [ ] Accessibility checked
- [ ] No console errors
- [ ] Performance acceptable

## Example Workflows (With Explicit Announcements)

### Example 1: Add New Component
```
User: "Create a ReviewCard component"

AI Response:
📋 ANALYZING REQUIREMENTS
- Task: Create ReviewCard component for displaying user reviews
- Affected areas: Frontend (React component)
- Agent selection: frontend-agent (React/TypeScript expertise)

📚 LOADING CONTEXT
- Reading steering files: conventions.md, ui.md, structure.md
- Checking existing patterns: ProductCard component (similar card pattern)
- Identifying reusable components: Card styling, badge patterns
- Running context-gatherer: No (familiar area, ProductCard exists)

Key findings from steering files:
- conventions.md: Use PascalCase, define Props interface, useCallback for handlers
- ui.md: Card pattern: bg-[#111111] border border-[#c9a96e]/10 rounded-2xl
- ProductCard: Similar structure with image, title, rating, badges

🤖 ACTIVATING AGENT: frontend-agent
- Reason: React component creation with TypeScript
- Expertise needed: Component patterns, TypeScript interfaces, Tailwind styling
- Patterns to follow: ProductCard structure, card styling from ui.md

🎨 DESIGN PLAN
- Component structure: ReviewCard with user info, rating, text
- Types/interfaces: ReviewCardProps { review: Review; onAction?: () => void }
- State management: None needed (presentational component)
- Reusing: Card styling pattern, Star rating pattern from ProductCard

⚙️ IMPLEMENTING
- Following pattern: ProductCard component structure
- Using conventions from: conventions.md (Props interface, naming)
- Maintaining: Type safety (strict TypeScript), accessibility (semantic HTML)

[Code implementation here...]

✅ VERIFICATION
- Build status: Checking TypeScript compilation... ✓ Passed
- Design consistency: Verified against ui.md (dark luxury theme, gold accents)
- Accessibility: aria-label added, semantic HTML used
- Pattern adherence: Matches ProductCard structure ✓
```

### Example 2: Style Existing Component
```
User: "Update button hover effects"

AI Response:
📋 ANALYZING REQUIREMENTS
- Task: Update button hover effects for consistency
- Affected areas: Design/styling
- Agent selection: design-agent (UI/UX expertise)

📚 LOADING CONTEXT
- Reading steering files: ui.md (design system)
- Checking existing patterns: Button styles in ui.md
- Identifying reusable components: Primary/Secondary/Ghost button patterns
- Running context-gatherer: No (styling task, ui.md has all info)

Key findings from ui.md:
- Primary button: hover:bg-[#e8d5a3] transition-colors duration-300
- All transitions: 300-500ms duration
- Hover effects: Scale, opacity, color changes

🤖 ACTIVATING AGENT: design-agent
- Reason: UI styling and hover effects
- Expertise needed: Tailwind CSS, animation patterns, design consistency
- Patterns to follow: Button patterns from ui.md, 300ms transitions

[Implementation continues...]
```

### Example 3: Fix Bug
```
User: "Cart total is incorrect"

AI Response:
📋 ANALYZING REQUIREMENTS
- Task: Debug cart total calculation
- Affected areas: State management (useCart hook)
- Agent selection: debug-agent (error troubleshooting)

📚 LOADING CONTEXT
- Reading steering files: structure.md (state management patterns)
- Checking existing patterns: useCart hook in store/cartStore.ts
- Identifying reusable components: N/A (debugging task)
- Running context-gatherer: No (specific file identified)

🤖 ACTIVATING AGENT: debug-agent
- Reason: Calculation error in state management
- Expertise needed: React hooks debugging, state calculations
- Patterns to follow: Error handling from conventions.md

[Debugging continues...]
```

## Integration with Kiro Features

### Hooks
- **preToolUse** — Verify write operations follow conventions
- **postToolUse** — Run linter after file edits
- **fileEdited** — Auto-format on save
- **promptSubmit** — Load steering files before responding

### Specs
- Use specs for complex features
- Break into tasks (design → implementation → testing)
- Reference steering files in spec

### MCP Servers
- Supabase integration for backend (when ready)
- Use mcp_supabase_* tools for database operations

## Maintenance

### Updating Steering Files
When project evolves:
1. Update relevant steering file
2. Notify team of changes
3. Ensure agents follow new patterns

### Adding New Agents
To add a specialized agent:
1. Create `.kiro/agents/new-agent.md`
2. Define role, expertise, responsibilities
3. Add routing rules to SYSTEM.md
4. Document when to activate

### Reviewing Code Quality
Periodically:
1. Run refactor-agent on codebase
2. Check for pattern violations
3. Update conventions.md if needed
4. Ensure steering files are current

## Getting Started

### For New Developers
1. Read SYSTEM.md (this file)
2. Review all steering files in `.kiro/steering/`
3. Understand agent specializations
4. Follow workflow for all tasks

### For AI Assistants
1. **ALWAYS announce each workflow phase explicitly**
2. Load all steering files on startup
3. **Show which steering files are being read and key findings**
4. **Announce agent activation with reasoning**
5. Treat steering files as source of truth
6. Route tasks to appropriate agents
7. Follow behavior rules strictly
8. **Announce verification steps and results**
9. Verify quality checklist before completion

**TRANSPARENCY REQUIREMENT:**
Every response must show:
- 📋 What task is being analyzed
- 📚 Which steering files are being read
- 🤖 Which agent is being activated and why
- 🎨 What patterns are being followed
- ⚙️ What conventions are being used
- ✅ What verification was performed

**RESPONSE FORMAT:**
Use the template in `RESPONSE_TEMPLATE.md` for every development task.
This ensures transparency and proves the autonomous system is working.

## Support

### Questions?
- Check steering files first
- Review agent documentation
- Ask for clarification if unclear

### Issues?
- Route to debug-agent
- Check conventions.md for patterns
- Verify against steering files

---

**Remember**: Context first, patterns always, quality over speed.
