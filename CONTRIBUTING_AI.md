# FileNova — Contributing Guide for AI Agents

**Purpose:** How AI coding agents should interact with the FileNova codebase.

---

## 1. Who This Guide Is For

This guide is for AI coding agents working on FileNova:
- Kilo Code
- OpenAI Codex
- Claude Code
- Gemini CLI
- Future AI agents

---

## 2. Before You Start

### 2.1 Read These Files (In Order)
1. **`AGENTS.md`** — Master instruction file. Read this FIRST.
2. **`PROJECT_CONTEXT.md`** — Understand the project before touching code.
3. **`TASKS.md`** — See what needs to be done.
4. **`CODING_STANDARDS.md`** — Follow conventions.
5. **`TESTING_GUIDE.md`** — Verify your work.

### 2.2 Environment Setup
```bash
# Clone and install
git clone <repo-url>
cd file_nova
pnpm install

# Start development
pnpm dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3000

# Type check
pnpm typecheck

# Run tests
pnpm test
```

---

## 3. How to Make Changes

### 3.1 Workflow
```
1. Understand the task
   ↓ Read relevant files
   ↓ Ask for clarification if ambiguous

2. Plan the approach
   ↓ Identify affected components
   ↓ Check for regressions
   ↓ Plan testing

3. Make changes
   ↓ Follow CODING_STANDARDS.md
   ↓ Use semantic theme tokens
   ↓ Support both light + dark modes

4. Verify
   ↓ Run typecheck
   ↓ Run tests
   ↓ Manual QA per TESTING_GUIDE.md
   ↓ Check regression checklist

5. Document
   ↓ Update CHANGELOG_AI.md
   ↓ Update relevant docs if needed
```

### 3.2 Rules
- **NEVER** remove features without explicit instruction
- **NEVER** break existing API contracts
- **NEVER** introduce hardcoded colors (`bg-white`, `text-black`)
- **NEVER** use `any` types without justification
- **NEVER** call `fetch()` directly in UI components
- **ALWAYS** use semantic theme tokens
- **ALWAYS** support light + dark modes
- **ALWAYS** add keyboard navigation
- **ALWAYS** verify before claiming done

---

## 4. What You Can Change

### 4.1 Safe to Modify
- Component implementations (following patterns)
- Styles (using design system tokens)
- Hooks (extracting/refactoring)
- Static content (toolContent.ts, blogPosts.ts)
- Documentation (this guide, ARCHITECTURE.md, etc.)
- Tests

### 4.2 Requires Care
- Routing (check all routes still work)
- State management (check re-renders)
- API client (check all endpoints still called)
- Database schema (check migrations)
- Authentication flow (check login/logout)

### 4.3 Do NOT Touch Without Instruction
- `.env` files
- `package.json` dependencies (ask first)
- `lib/db/src/schema/` (migrations required)
- `vercel.json` / `railway.toml` (deployment config)
- Existing commit history

---

## 5. Common Tasks

### 5.1 Adding a New Tool Page
1. Create page at `artifacts/file-nova/src/pages/tools/ToolName.tsx`
2. Add lazy import in `App.tsx`
3. Add route in `App.tsx` `<Switch>`
4. Add content in `src/data/toolContent.ts`
5. Create sidebar if needed in `src/sidebars/`
6. Add tool adapter in `src/assistant/toolAdapters/pdfTools.ts`

### 5.2 Adding a New Component
1. Determine type: `ui/`, `workspace/`, or feature-specific
2. Follow component structure in `CODING_STANDARDS.md`
3. Support light + dark modes
4. Add keyboard navigation if interactive
5. Add loading/error/empty states

### 5.3 Fixing a Bug
1. Reproduce the bug
2. Find root cause (not just symptom)
3. Fix with minimal changes
4. Verify fix works
5. Check for similar bugs elsewhere
6. Update `TASKS.md` if bug was listed

### 5.4 Refactoring
1. Ensure tests pass before starting
2. Make incremental changes
3. Verify behavior unchanged after each step
4. Update documentation if patterns change

---

## 6. Quality Gates

### 6.1 Before Creating a PR
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] No console errors in dev/build
- [ ] Manual QA completed
- [ ] CHANGELOG_AI.md updated
- [ ] No features removed
- [ ] No routes broken
- [ ] Theme (light + dark) verified
- [ ] Responsive behavior verified

### 6.2 Code Review Checklist
- [ ] Follows existing patterns
- [ ] No unnecessary changes
- [ ] Types are correct
- [ ] Error handling is proper
- [ ] Accessibility preserved
- [ ] Performance maintained

---

## 7. Communication

### 7.1 When Stuck
- Re-read relevant documentation
- Search codebase for similar patterns
- Ask the user for clarification (don't guess)

### 7.2 Reporting Issues
```
I found an issue with [component/file]:
- **Problem:** [description]
- **Root cause:** [if identified]
- **Suggested fix:** [if any]
- **Impact:** [what breaks]
```

### 7.3 Progress Updates
After completing a task:
```
✅ Task completed: [name]

Changes:
- Modified: `path/to/file1.ts`
- Added: `path/to/file2.ts`
- Removed: none

Verification:
- TypeScript: ✅
- Tests: ✅
- QA: ✅ (list checks)
- Theme: ✅
- Regressions: ✅ none detected
```

---

## 8. Handling Edge Cases

### 8.1 No Backend Available
- Frontend must work in mock mode
- Use `apiMock` instead of `apiClient`
- Show `ConnectionStatusIndicator`

### 8.2 Feature Flags
```ts
if (isFeatureEnabled('voice')) {
  // Voice feature code
}
```
Check `src/features.config.ts` before using premium/experimental features.

### 8.3 Internationalization
```ts
const { t, tText } = useTranslation();
const title = t('page.title');
const dynamic = tText(userInput);
```
All user-visible strings must be translatable.

---

## 9. Anti-Patterns

### 9.1 Never Do This

```tsx
// ❌ Hardcoded colors
<div className="bg-white text-black">

// ❌ Fetch in component
useEffect(() => {
  fetch('/api/data').then(...)
}, []);

// ❌ Any types without justification
const data: any = response;

// ❌ Index as key
{items.map((item, i) => <div key={i}>{item}</div>)}

// ❌ Console logs left behind
console.log('debug:', data);

// ❌ Inline styles for layout
<div style={{ marginTop: 17 }}>
```

### 9.2 Always Do This

```tsx
// ✅ Semantic tokens
<div className="bg-background text-foreground">

// ✅ API layer
const { data } = useQuery({ queryKey: ['data'], queryFn: apiClient.getData });

// ✅ Typed properly
interface Data { id: string; name: string; }
const data: Data = response;

// ✅ Stable keys
{items.map(item => <div key={item.id}>{item.name}</div>)}

// ✅ Proper logging
logger.info({ userId }, 'File uploaded');
```

---

## 10. Documentation Standards

### 10.1 When to Document
- Complex algorithms
- Non-obvious decisions
- Public API surfaces
- Architecture changes

### 10.2 How to Document
- Use markdown files in `docs/` or project root
- Cross-reference between related docs
- Keep documentation in sync with code
- Update `CHANGELOG_AI.md` for all changes

---

## 11. Emergency Procedures

### 11.1 If You Break Something
1. Stop making changes
2. Revert to last working state (`git checkout -- <files>`)
3. Analyze what went wrong
4. Fix incrementally with verification

### 11.2 If Unsure
1. Ask for clarification
2. Document what you found
3. Propose options, don't decide unilaterally

---

## 12. Success Criteria

A task is complete when:
- [ ] Functionality works as specified
- [ ] No regressions detected
- [ ] Code follows all standards in `CODING_STANDARDS.md`
- [ ] UI verified in light + dark modes
- [ ] Responsive behavior verified
- [ ] Accessibility preserved
- [ ] Performance maintained
- [ ] Documentation updated
- [ ] TypeScript compiles
- [ ] Tests pass

---

## 13. Continuous Learning

- Study existing components before writing new ones
- Read commit history to understand why code exists
- Follow the project's established patterns
- Don't introduce new patterns without discussion

---

**Remember:** You are a guest in this codebase. Leave it better than you found it.
