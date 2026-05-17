# Quick Start Guide — AromaHR Autonomous System

## 🎯 What Is This?

This is a **fully autonomous coding system** for AromaHR that ensures:
- ✅ Architectural consistency
- ✅ Code quality
- ✅ Pattern adherence
- ✅ Specialized expertise

## 📁 System Structure

```
.kiro/
├── SYSTEM.md              ← Complete system documentation
├── README.md              ← Overview
├── QUICK_START.md         ← This file
├── steering/              ← Project context (auto-loaded)
│   ├── product.md         ← Business & features
│   ├── tech.md            ← Technology stack
│   ├── structure.md       ← Architecture
│   ├── conventions.md     ← Code standards
│   ├── api.md             ← API guide
│   └── ui.md              ← Design system
└── agents/                ← Specialized experts
    ├── frontend-agent.md  ← React/TypeScript
    ├── backend-agent.md   ← Node.js/Express
    ├── design-agent.md    ← UI/UX
    ├── debug-agent.md     ← Debugging
    └── refactor-agent.md  ← Code quality
```

## 🚀 For Developers

### First Time Setup
1. Read `SYSTEM.md` (5 min)
2. Skim all steering files (10 min)
3. Review agent documentation (5 min)

### Daily Workflow
```
1. Get task → 2. Read context → 3. Code → 4. Verify
```

### Key Files to Know
- `steering/conventions.md` — How to write code
- `steering/ui.md` — How to style components
- `steering/structure.md` — Where files go
- `SYSTEM.md` — How the system works

## 🤖 For AI Assistants

### Initialization
```
1. Load SYSTEM.md
2. Load ALL steering files
3. Understand agent routing
4. Follow behavior rules
```

### Task Routing
```
UI/styling       → design-agent
React/frontend   → frontend-agent
Express/API      → backend-agent
Errors/bugs      → debug-agent
Cleanup/optimize → refactor-agent
```

### Behavior Rules
```
✅ DO:
- Read context before coding
- Follow existing patterns
- Reuse components
- Maintain type safety
- Ensure accessibility
- Use steering files as truth

❌ DON'T:
- Code without context
- Break patterns
- Create duplicates
- Use 'any' types
- Ignore accessibility
- Deviate from design system
```

### Quality Checklist
```
Before:
□ Context gathered
□ Steering files read
□ Patterns identified
□ Agent selected

During:
□ Types defined
□ Props documented
□ Validation added
□ Accessibility ensured

After:
□ Build passes
□ Functionality tested
□ Design consistent
□ No errors
```

## 📚 Key Concepts

### 1. Context-First Development
**Never code without understanding the codebase.**

Use context-gatherer agent or manually review:
- Existing components
- Naming conventions
- State management patterns
- Design system

### 2. Steering Files = Source of Truth
**Always load and follow steering files.**

They contain:
- Business rules
- Technical standards
- Code conventions
- Design patterns

### 3. Specialized Agents
**Route tasks to the right expert.**

Each agent has:
- Specific expertise
- Code patterns
- Best practices
- When to activate

### 4. Pattern Adherence
**Consistency over creativity.**

- Reuse ProductCard pattern
- Follow naming conventions
- Use established hooks
- Maintain design system

## 🎨 Design System Quick Reference

### Colors
```css
bg-[#0a0a0a]      /* Primary background */
bg-[#111111]      /* Card backgrounds */
bg-[#c9a96e]      /* Gold accent */
text-[#e8d5a3]    /* Cream text */
border-[#c9a96e]/10 /* Subtle border */
```

### Typography
```css
font-['Playfair_Display'] /* Headings */
font-['Inter']             /* Body */
text-sm font-bold tracking-[0.15em] uppercase
```

### Components
```typescript
// Button
className="bg-[#c9a96e] text-[#0a0a0a] px-6 py-3 rounded-xl hover:bg-[#e8d5a3] transition-colors"

// Card
className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-6"

// Input
className="bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-3 rounded-xl focus:border-[#c9a96e]"
```

## 🔧 Common Tasks

### Add New Component
```
1. Check if similar component exists (reuse!)
2. Read conventions.md + ui.md
3. Route to frontend-agent
4. Follow ProductCard pattern
5. Verify build passes
```

### Style Component
```
1. Read ui.md for design system
2. Route to design-agent
3. Apply consistent styles
4. Ensure accessibility
```

### Fix Bug
```
1. Reproduce issue
2. Route to debug-agent
3. Analyze and fix
4. Test thoroughly
```

### Refactor Code
```
1. Identify code smells
2. Route to refactor-agent
3. Improve quality
4. Verify functionality
```

## 📖 Documentation

### Essential Reading
1. **SYSTEM.md** — Complete system overview
2. **steering/conventions.md** — Code standards
3. **steering/ui.md** — Design system
4. **steering/structure.md** — Architecture

### Reference
- **steering/product.md** — Business context
- **steering/tech.md** — Technology stack
- **steering/api.md** — API integration
- **agents/*.md** — Agent documentation

## 🆘 Getting Help

### Questions?
1. Check steering files
2. Review agent docs
3. Read SYSTEM.md
4. Ask for clarification

### Issues?
1. Route to debug-agent
2. Check conventions.md
3. Verify against steering files

## 🎯 Success Metrics

You're using the system correctly when:
- ✅ Code follows existing patterns
- ✅ Components are reused
- ✅ Types are strict
- ✅ Design is consistent
- ✅ Build passes
- ✅ Tests pass
- ✅ Accessibility is ensured

## 🚦 Next Steps

### For Developers
1. ✅ Read this file
2. ⬜ Read SYSTEM.md
3. ⬜ Review steering files
4. ⬜ Start coding with system

### For AI Assistants
1. ✅ Load SYSTEM.md
2. ⬜ Load all steering files
3. ⬜ Understand agent routing
4. ⬜ Follow workflow strictly

---

**Ready to start? Read SYSTEM.md for complete documentation.**
