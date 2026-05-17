---
title: AromaHR Master Instructions - ALWAYS FOLLOW
inclusion: auto
priority: 1
---

# 🚨 CRITICAL: AUTONOMOUS SYSTEM INSTRUCTIONS

**YOU ARE OPERATING IN AN AUTONOMOUS CODING SYSTEM.**

Every response MUST follow the transparent workflow defined in this system.

---

## 📋 MANDATORY WORKFLOW FOR EVERY TASK

### 1. ANALYZE REQUIREMENTS
**ALWAYS start with:**
```
📋 ANALYZING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task: [describe what needs to be done]
Affected areas: [Frontend/Backend/Design/Database]
Complexity: [Simple/Medium/Complex]
Agent selection: [which agent will handle this]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. LOAD CONTEXT
**ALWAYS show which steering files you're reading:**
```
📚 LOADING CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reading steering files:
  ✓ conventions.md — [key findings from this file]
  ✓ ui.md — [key findings from this file]
  ✓ structure.md — [key findings from this file]
  ✓ [other relevant files]

Checking existing patterns:
  ✓ [Component/Pattern name] — [what you found]

Identifying reusable components:
  ✓ [Component name] — [how it will be reused]

Running context-gatherer: [Yes/No - explain why]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. ACTIVATE AGENT
**ALWAYS announce which agent is handling the task:**
```
🤖 ACTIVATING AGENT: [agent-name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reason: [why this specific agent]
Expertise needed: [specific skills required]
Patterns to follow:
  • [Pattern 1 from steering files]
  • [Pattern 2 from steering files]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. DESIGN PLAN (for new features)
```
🎨 DESIGN PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Show your approach]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. IMPLEMENT
**ALWAYS show what conventions you're following:**
```
⚙️ IMPLEMENTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Following pattern: [specific pattern from steering files]
Using conventions from: [which steering file sections]
Maintaining: Type safety, accessibility, design consistency
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 6. VERIFY
**ALWAYS show verification results:**
```
✅ VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build status: [checking...] ✓ Passed
Design consistency: ✓ Verified against ui.md
Accessibility: ✓ Checked
Pattern adherence: ✓ Confirmed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎯 AGENT ROUTING RULES

**Automatically route based on keywords:**

### Frontend Keywords → frontend-agent
- component, hook, state, props, routing, React, TypeScript
- Example: "Create a ReviewCard component"

### Backend Keywords → backend-agent
- endpoint, API, database, query, authentication, migration, Express, PostgreSQL
- Example: "Create an API endpoint for orders"

### Design Keywords → design-agent
- style, color, layout, responsive, animation, Tailwind, CSS, hover
- Example: "Update button hover effects"

### Debug Keywords → debug-agent
- error, bug, not working, broken, fix, issue, problem
- Example: "Cart total is incorrect"

### Refactor Keywords → refactor-agent
- refactor, optimize, cleanup, improve, simplify, performance
- Example: "Optimize HomePage performance"

---

## 📚 STEERING FILES REFERENCE

**These files are auto-loaded and contain the source of truth:**

1. **product.md** — Business context, features, user flows
2. **tech.md** — Technology stack, dependencies
3. **structure.md** — Project architecture, file organization
4. **conventions.md** — Code standards, naming, patterns
5. **api.md** — API endpoints, integration guide
6. **ui.md** — Design system, colors, typography, components

**ALWAYS reference these files in your "LOADING CONTEXT" section.**

---

## 🚫 NEVER DO THIS

❌ Start coding without showing the workflow
❌ Skip the "LOADING CONTEXT" section
❌ Forget to announce which agent is being used
❌ Ignore existing patterns
❌ Skip verification
❌ Use 'any' types in TypeScript
❌ Break the design system
❌ Create duplicate components

---

## ✅ ALWAYS DO THIS

✅ Show the complete workflow (ANALYZE → LOAD → ACTIVATE → IMPLEMENT → VERIFY)
✅ Read and reference steering files
✅ Announce which agent is handling the task
✅ Follow existing patterns (especially ProductCard)
✅ Maintain type safety (strict TypeScript)
✅ Ensure accessibility (WCAG 2.1)
✅ Verify build passes
✅ Check design consistency

---

## 🎨 DESIGN SYSTEM QUICK REFERENCE

**Colors:**
- Background: `bg-[#0a0a0a]` (primary), `bg-[#111111]` (cards)
- Accent: `bg-[#c9a96e]` (gold), `text-[#e8d5a3]` (cream)
- Borders: `border-[#c9a96e]/10` to `/30`

**Typography:**
- Headings: `font-['Playfair_Display']`
- Body: `font-['Inter']`
- Uppercase: `tracking-[0.15em] uppercase`

**Components:**
- Cards: `bg-[#111111] border border-[#c9a96e]/10 rounded-2xl`
- Buttons: `bg-[#c9a96e] text-[#0a0a0a] px-6 py-3 rounded-xl hover:bg-[#e8d5a3] transition-colors`
- Inputs: `bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-3 rounded-xl focus:border-[#c9a96e]`

---

## 📖 EXAMPLE RESPONSE

```
📋 ANALYZING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task: Create a ReviewCard component
Affected areas: Frontend (React component)
Agent selection: frontend-agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 LOADING CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reading steering files:
  ✓ conventions.md — Use PascalCase, define Props interface
  ✓ ui.md — Card pattern: bg-[#111111] border border-[#c9a96e]/10
  ✓ structure.md — Components go in src/components/

Checking existing patterns:
  ✓ ProductCard — Similar card structure found

Running context-gatherer: No (familiar area)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 ACTIVATING AGENT: frontend-agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reason: React component creation
Expertise needed: TypeScript, component patterns
Patterns to follow: ProductCard structure, ui.md card styling
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️ IMPLEMENTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Following pattern: ProductCard component structure
Using conventions from: conventions.md, ui.md
Maintaining: Type safety, accessibility, design consistency
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CODE HERE]

✅ VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build status: ✓ Passed
Design consistency: ✓ Verified
Accessibility: ✓ Checked
Pattern adherence: ✓ Confirmed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔥 CRITICAL REMINDER

**THIS IS NOT OPTIONAL.**

Every development task response MUST follow this format. The user has set up this autonomous system specifically to ensure:
- Architectural consistency
- Pattern adherence
- Code quality
- Transparency

**If you skip the workflow, you're breaking the system.**

---

## 📝 SUMMARY

1. ✅ Always show the 6-phase workflow
2. ✅ Always reference steering files
3. ✅ Always announce the agent
4. ✅ Always follow existing patterns
5. ✅ Always verify your work

**See `.kiro/SYSTEM.md` and `.kiro/RESPONSE_TEMPLATE.md` for complete documentation.**
