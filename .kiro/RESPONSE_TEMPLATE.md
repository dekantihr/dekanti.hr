# AI Response Template

**CRITICAL: Use this template structure for EVERY development task response.**

---

## Standard Response Format

```markdown
📋 ANALYZING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task: [Clear description of what needs to be done]
Affected areas: [Frontend/Backend/Design/Database/etc.]
Complexity: [Simple/Medium/Complex]
Agent selection: [Which agent(s) will handle this]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 LOADING CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reading steering files:
  ✓ conventions.md — [key findings]
  ✓ ui.md — [key findings]
  ✓ structure.md — [key findings]
  ✓ [other relevant files]

Checking existing patterns:
  ✓ [Component/Pattern name] — [what was found]
  ✓ [Another pattern] — [what was found]

Identifying reusable components:
  ✓ [Component name] — [how it will be reused]

Running context-gatherer: [Yes/No]
  Reason: [Why or why not]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 ACTIVATING AGENT: [agent-name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reason: [Why this specific agent]
Expertise needed: [Specific skills required]
Patterns to follow:
  • [Pattern 1 from steering files]
  • [Pattern 2 from steering files]
  • [Pattern 3 from steering files]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 DESIGN PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Component structure:
  [Outline the structure]

Types/interfaces:
  [List TypeScript interfaces needed]

State management:
  [Approach: hooks, props, context, etc.]

Reusing from existing codebase:
  • [Component/pattern 1]
  • [Component/pattern 2]

Following conventions from:
  • conventions.md: [specific rules]
  • ui.md: [specific styles]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️ IMPLEMENTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Following pattern: [Specific pattern from steering files]
Using conventions from: [Which steering file sections]
Maintaining:
  ✓ Type safety (strict TypeScript)
  ✓ Accessibility (WCAG 2.1)
  ✓ Design consistency (dark luxury theme)
  ✓ Pattern adherence (existing conventions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CODE IMPLEMENTATION HERE]

✅ VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build status: [Checking TypeScript compilation...] ✓ Passed
Design consistency: [Verified against ui.md] ✓ Matches dark luxury theme
Accessibility: [Checked ARIA labels, semantic HTML] ✓ Compliant
Pattern adherence: [Compared to existing components] ✓ Follows conventions
Type safety: [No 'any' types, strict mode] ✓ Verified
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Brief summary of what was done and key decisions made]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Quick Reference: When to Use Each Section

### 📋 ANALYZING REQUIREMENTS
**Always include.** Shows you understand the task.

### 📚 LOADING CONTEXT
**Always include.** Proves you read steering files and checked patterns.

**Must show:**
- Which steering files were read
- Key findings from each file
- Existing patterns checked
- Whether context-gatherer was used

### 🤖 ACTIVATING AGENT
**Always include.** Shows which expert is handling the task.

**Must show:**
- Agent name (frontend/backend/design/debug/refactor)
- Why this agent was chosen
- What expertise is needed
- Which patterns will be followed

### 🎨 DESIGN PLAN
**Include for new features/components.** Skip for simple fixes.

**Must show:**
- Component structure
- TypeScript interfaces
- State management approach
- What's being reused

### ⚙️ IMPLEMENTING
**Always include before code.** Shows what conventions are being followed.

**Must show:**
- Which pattern is being followed
- Which steering file sections are being used
- What quality standards are being maintained

### ✅ VERIFICATION
**Always include after code.** Proves quality checks were done.

**Must show:**
- Build status
- Design consistency check
- Accessibility check
- Pattern adherence check
- Type safety check

### 📝 SUMMARY
**Always include.** Brief recap of what was done.

---

## Examples by Task Type

### Simple Styling Change
```
📋 ANALYZING REQUIREMENTS
📚 LOADING CONTEXT (focus on ui.md)
🤖 ACTIVATING AGENT: design-agent
⚙️ IMPLEMENTING
[code]
✅ VERIFICATION
📝 SUMMARY
```

### New Component
```
📋 ANALYZING REQUIREMENTS
📚 LOADING CONTEXT (conventions.md, ui.md, structure.md)
🤖 ACTIVATING AGENT: frontend-agent
🎨 DESIGN PLAN
⚙️ IMPLEMENTING
[code]
✅ VERIFICATION
📝 SUMMARY
```

### Bug Fix
```
📋 ANALYZING REQUIREMENTS
📚 LOADING CONTEXT (structure.md, conventions.md)
🤖 ACTIVATING AGENT: debug-agent
⚙️ IMPLEMENTING
[code]
✅ VERIFICATION
📝 SUMMARY
```

### Refactoring
```
📋 ANALYZING REQUIREMENTS
📚 LOADING CONTEXT (conventions.md, structure.md)
🤖 ACTIVATING AGENT: refactor-agent
🎨 DESIGN PLAN (refactoring approach)
⚙️ IMPLEMENTING
[code]
✅ VERIFICATION
📝 SUMMARY
```

---

## Emoji Legend

- 📋 Requirements analysis
- 📚 Context loading (steering files)
- 🤖 Agent activation
- 🎨 Design planning
- ⚙️ Implementation
- ✅ Verification
- 📝 Summary
- ✓ Checkmark (completed)
- • Bullet point

---

## Critical Rules

1. **NEVER skip the context loading section** — Always show which steering files were read
2. **ALWAYS announce the agent** — Show which expert is handling the task
3. **ALWAYS verify** — Show build status, design consistency, accessibility
4. **Be specific** — Don't say "read conventions.md", say "conventions.md: Use PascalCase for components, define Props interface"
5. **Show findings** — Don't just list files, show what you learned from them

---

## Bad Example (Don't Do This)

```
I'll create a ReviewCard component.

[code]

Done!
```

**Problems:**
- ❌ No context loading shown
- ❌ No agent activation
- ❌ No pattern reference
- ❌ No verification
- ❌ User has no idea what process was followed

---

## Good Example (Do This)

```
📋 ANALYZING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task: Create ReviewCard component for displaying user reviews
Affected areas: Frontend (React component)
Complexity: Medium
Agent selection: frontend-agent (React/TypeScript expertise)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 LOADING CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reading steering files:
  ✓ conventions.md — Use PascalCase, define Props interface, useCallback for handlers
  ✓ ui.md — Card pattern: bg-[#111111] border border-[#c9a96e]/10 rounded-2xl
  ✓ structure.md — Components go in src/components/, export default

Checking existing patterns:
  ✓ ProductCard — Similar card structure with image, title, rating, badges

Identifying reusable components:
  ✓ Star rating pattern from ProductCard
  ✓ Card styling from ui.md

Running context-gatherer: No
  Reason: Familiar area, ProductCard provides clear pattern
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 ACTIVATING AGENT: frontend-agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reason: React component creation with TypeScript
Expertise needed: Component patterns, TypeScript interfaces, Tailwind styling
Patterns to follow:
  • ProductCard component structure (props interface, export default)
  • Card styling from ui.md (dark luxury theme)
  • Star rating pattern from ProductCard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Rest of response...]
```

**Why this is good:**
- ✅ Shows context was loaded
- ✅ Shows which files were read and what was learned
- ✅ Shows agent activation with reasoning
- ✅ Shows patterns being followed
- ✅ User can see the entire process
