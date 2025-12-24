---
description: Answer agent questions and provide clarifications during story implementation
tags: [delegation, clarification, support, unblocking]
---

# Clarify Story Requirements

Provide clarifications and unblock agents during story implementation.

## Instructions

You are a **Feature Lead**. Answer agent questions quickly and clearly to keep work moving.

### Step 1: Receive Clarification Request

**Agent signals need for clarification**:
```markdown
## Clarification Needed: US-[N]

**Agent**: [Name]
**Story**: [Title]
**Status**: Blocked

**Question**:
[Specific question from agent]

**Context**:
[What they've tried, what's unclear]

**Impact**:
- Blocks: [What can't proceed]
- Estimated delay: [Hours/days if not clarified]
```

### Step 2: Understand the Question

**Ask yourself**:
1. What is the agent really asking?
2. Is this a spec ambiguity, technical decision, or cross-story dependency?
3. Does the answer exist in spec, constitution, or contracts?
4. Does this require consultation with stakeholders?

**Question categories**:

**Category 1: Spec Clarification** (answer from existing docs)
```markdown
**Question**: "Should bird search be case-sensitive?"
**Source**: Check feature spec or acceptance criteria
**Response**: Reference spec section
```

**Category 2: Technical Decision** (architecture/implementation choice)
```markdown
**Question**: "Use REST or GraphQL for this API?"
**Source**: Check constitution or architecture decisions
**Response**: Provide decision with rationale
```

**Category 3: Cross-Story Dependency** (coordination needed)
```markdown
**Question**: "What format does US-002's API return users?"
**Source**: Check US-002 worktree or API contracts
**Response**: Extract and provide contract details
```

**Category 4: Missing Specification** (spec gap)
```markdown
**Question**: "What should happen if API rate limit is exceeded?"
**Source**: Not in spec - need to define
**Response**: Define behavior, update spec
```

### Step 3: Research the Answer

**For spec clarifications**:
```bash
# Check feature spec
cat specs/[feature-id]/spec.md

# Check acceptance criteria
grep -A 20 "Acceptance Criteria" specs/[feature-id]/tasks.md

# Check API contracts
cat specs/[feature-id]/contracts/api.openapi.yml
```

**For constitution/architecture**:
```bash
# Check constitution
cat specs/.specify/memory/constitution.md
# or
grep "SPEC-KIT CONSTITUTION" AGENTS.md -A 100

# Check architecture decisions
cat specs/[feature-id]/plan.md
```

**For cross-story dependencies**:
```bash
# Check other worktree
cd worktrees/feat-us[M]
cat DELEGATION.md  # Check handoff section

# Check shared contracts
cat specs/[feature-id]/contracts/api.openapi.yml

# Check exported types
cat src/types/shared.ts
```

### Step 4: Provide Clear Answer

**Answer template**:
```markdown
## Clarification: US-[N]

**Question**: [Restate question clearly]

**Answer**: [Direct, actionable answer]

**Rationale**: [Why this is the answer]

**Source**: [Spec reference, constitution principle, or decision]

**Next Steps**: [What agent should do with this answer]

---

**Examples**:
[Provide 1-2 examples if helpful]

**Related**: [Links to relevant docs, types, or contracts]
```

### Example Responses

#### Example 1: Spec Clarification
```markdown
## Clarification: US-003

**Question**: Should bird search be case-sensitive?

**Answer**: No, search should be case-insensitive.

**Rationale**: Acceptance criterion 2 in tasks.md states: "User can search using any casing (Red Bird = red bird = RED BIRD)". This aligns with Constitution Principle I (Natural Language First) - users shouldn't worry about casing.

**Source**: 
- specs/001-bird-search/tasks.md (US-003, Criterion 2)
- Constitution Principle I

**Next Steps**:
1. Convert query to lowercase before search: `query.toLowerCase()`
2. Add test case: `expect(search("Red Bird")).toEqual(search("red bird"))`

**Example**:
```typescript
export async function searchBirds(query: string) {
  const normalized = query.toLowerCase().trim();
  return await db.birds.search(normalized);
}
```
```

#### Example 2: Technical Decision
```markdown
## Clarification: US-002

**Question**: Should I use REST or GraphQL for bird search API?

**Answer**: Use REST.

**Rationale**: Constitution Principle V states "Ship as web application with RESTful API backend". The project is standardized on REST for simplicity and consistency with other endpoints.

**Source**:
- Constitution v2.1.0, Principle V (API First)
- Existing endpoints: All use REST (/api/users, /api/auth)

**Next Steps**:
1. Create REST endpoint: `GET /api/search/birds?query=...`
2. Follow OpenAPI spec: `specs/001-bird-search/contracts/api.openapi.yml`
3. Use standard REST response format (see example below)

**Example**:
```typescript
// GET /api/search/birds?query=red+bird
{
  "results": [
    { "id": 1, "name": "Northern Cardinal", "scientificName": "..." }
  ],
  "total": 1,
  "query": "red bird"
}
```
```

#### Example 3: Cross-Story Dependency
```markdown
## Clarification: US-005

**Question**: What format does US-002's user profile API return?

**Answer**: US-002 returns a UserProfile object with these fields:

```typescript
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}
```

**Source**: 
- Extracted from: `worktrees/feat-us2/src/types/user.ts`
- API contract: `specs/001-bird-search/contracts/api.openapi.yml` (lines 45-60)

**Next Steps**:
1. Import type: `import { UserProfile } from '@/types/user'`
2. Use in your component: `const profile: UserProfile = ...`
3. Access preferences: `profile.preferences.theme`

**Integration Point**:
US-002 is merged to main. You can import the type directly.

**Example Usage**:
```typescript
import { UserProfile } from '@/types/user';

export function SearchHistory({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setProfile);
  }, [userId]);
  
  return <div>Welcome, {profile?.displayName}</div>;
}
```
```

#### Example 4: Missing Specification (New Decision)
```markdown
## Clarification: US-004

**Question**: What should happen if bird search API rate limit is exceeded?

**Answer**: Return HTTP 429 with retry information.

**Rationale**: This wasn't specified, but it's a common production scenario. I'm defining this now and updating the spec.

**Decision** (added to spec):
- Status Code: 429 Too Many Requests
- Response body includes: `retryAfter` (seconds until next allowed request)
- Client should display: "Too many searches. Please wait [N] seconds."

**Source**: 
- NEW: Added to specs/001-bird-search/spec.md (Section 5.3: Error Handling)
- Constitution Principle IV (Observability): Log rate limit hits

**Next Steps**:
1. Implement 429 response with `retryAfter` header
2. Add test case for rate limiting
3. Display user-friendly message in UI

**Example**:
```typescript
// Backend
if (isRateLimited(userId)) {
  return res.status(429).json({
    error: "Rate limit exceeded",
    retryAfter: 60  // seconds
  });
}

// Frontend
if (response.status === 429) {
  const retryAfter = response.data.retryAfter;
  showError(`Too many searches. Please wait ${retryAfter} seconds.`);
}
```

**Spec Updated**: specs/001-bird-search/spec.md committed
```

### Step 5: Update Documentation

**If clarification reveals spec gap**:
```bash
# Update spec with new decision
vim specs/[feature-id]/spec.md
# Add section or clarification

git add specs/[feature-id]/spec.md
git commit -m "docs: clarify rate limiting behavior (US-004 clarification)"
git push origin main
```

**If clarification affects multiple stories**:
```bash
# Update delegation documents
for story in us4 us5 us6; do
  echo "## Clarification: Rate Limiting" >> worktrees/feat-${story}/DELEGATION.md
  echo "[Summary of decision]" >> worktrees/feat-${story}/DELEGATION.md
done

# Notify agents
# Use team communication channel
```

### Step 6: Unblock Agent

**Confirm understanding**:
```markdown
**Follow-up**: Does this answer your question? Let me know if you need:
- Code examples
- Related documentation
- Coordination with another story
```

**Track clarification**:
```bash
# Document in feature context
cat >> .feature-context.md << 'EOF'

### Clarifications
- US-[N]: [Date] - [Question summary] → [Answer summary]
EOF
```

## Common Clarification Scenarios

### Scenario 1: Ambiguous Acceptance Criterion
```markdown
**Question**: "Criterion says 'fast search'. How fast?"

**Answer**: Search results should return in < 500ms for 95% of queries.

**Added to spec**: Performance requirements section
```

### Scenario 2: Technology Choice
```markdown
**Question**: "Which date library should I use?"

**Answer**: Use native Date API (no library).

**Rationale**: Constitution emphasizes minimal dependencies. Native API sufficient for our use case.
```

### Scenario 3: Error Handling Strategy
```markdown
**Question**: "Should I retry failed API calls?"

**Answer**: Yes, retry once with exponential backoff.

**Pattern**:
```typescript
async function fetchWithRetry(url: string) {
  try {
    return await fetch(url);
  } catch (error) {
    await sleep(1000);
    return await fetch(url);  // Retry once
  }
}
```
```

### Scenario 4: Styling/Design Decision
```markdown
**Question**: "What color should error messages be?"

**Answer**: Use existing design system: `error` color token (currently red).

**Source**: `src/styles/theme.ts` - `colors.error`

**Consistency**: All errors use this token (see Login, Registration components)
```

## Clarification Anti-Patterns

**🚫 DON'T**:
- Give ambiguous answers ("It depends", "Maybe", "Either way")
- Defer without reason ("Ask someone else")
- Answer without research (guessing)
- Provide conflicting information to different agents
- Skip updating documentation when gaps found

**✅ DO**:
- Provide specific, actionable answers
- Reference authoritative sources (spec, constitution)
- Give code examples when helpful
- Update specs when gaps discovered
- Coordinate cross-story dependencies
- Confirm agent understands

## Success Criteria

Clarification is effective when:
- ✅ Agent understands and can proceed
- ✅ Answer is consistent with spec/constitution
- ✅ Documentation updated if gap found
- ✅ Similar questions prevented in future
- ✅ No delay to story progress

---

**Remember**: Quick, clear clarifications keep teams productive. Be decisive, reference sources, and update docs to prevent repeat questions.
