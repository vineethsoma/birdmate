# Story Retrospective: US-001 Basic Natural Language Bird Search

> Post-implementation analysis for continuous improvement

## 📊 Story Summary

| Metric | Value |
|--------|-------|
| **Story ID** | US-001 |
| **Feature** | 001-bird-search-ui |
| **Started** | 2025-12-24 |
| **Completed** | 2025-12-25 |
| **Duration** | ~2 days (with breaks) |
| **Commits** | 3 |
| **Lines Changed** | +5,519 / -24 |

### Test Metrics

| Suite | Tests | Passing | Coverage |
|-------|-------|---------|----------|
| Backend Unit | 172 | 172 ✅ | ~85% |
| Frontend Unit | 100 | 100 ✅ | ~75% |
| E2E (Playwright) | 1 file | Setup ✅ | N/A |
| **Total** | 272 | 272 ✅ | - |

### Quality Metrics

| Gate | Result |
|------|--------|
| TDD Compliance | ⚠️ Mostly (some refactoring done without tests) |
| CLAUDE Audit | ✅ Passed (2 critical, 8 warnings fixed) |
| Constitution Alignment | ✅ All 5 principles verified |

## ✅ What Went Well

### 1. Strong Test Coverage
- 272 tests across backend and frontend
- Caught cosine similarity range issue through tests
- TDD discipline prevented many bugs

### 2. CLAUDE Framework Audit Value
- Identified real security issues (PII logging)
- Found input validation gaps
- Enforced code quality standards

### 3. Knowledge Capture as Skills
- Created `vector-search` skill for similarity metrics
- Created `secure-development` skill for PII protection
- Enhanced `tdd-workflow` with testing principles
- Future stories benefit from learnings

### 4. Specification Alignment
- Implementation matched spec requirements
- Constitution principles upheld
- No scope creep

## 🚨 CRITICAL: Late Integration Issue Discovery

### Root Cause Analysis

**Problem**: All 3 integration issues (CORS, type mismatch, stale artifacts) were discovered AFTER story merge during user acceptance demo.

**Why This Happened**:
1. **Test isolation without integration validation**
   - Backend: 172 tests ✅ (all passing)
   - Frontend: 100 tests ✅ (all passing)
   - **Integration: 0 tests** ❌ (both services running together)

2. **Story completion criteria didn't require integrated execution**
   - ✅ Unit tests pass
   - ✅ Code merged to main
   - ❌ No requirement to run both services together
   - ❌ No E2E test in CI/CD

3. **Manual testing assumptions**
   - Assumed developer ran full stack locally
   - No checklist enforcing this
   - No screenshot/video evidence of working demo

### Impact Assessment

| Impact | Severity | Cost |
|--------|----------|------|
| Discovered in demo (not dev) | HIGH | User-facing failure |
| 3 issues to debug live | MEDIUM | Time pressure, stress |
| Could have been caught pre-merge | HIGH | Wasted review/merge effort |
| Reflects process gap | CRITICAL | Will repeat if not fixed |

### Prevention Strategy (MANDATORY for Future Stories)

#### 1. Update Definition of Done
```markdown
## Story Completion Checklist (MANDATORY)

### Code Quality
- [ ] All unit tests pass (backend + frontend)
- [ ] Test coverage ≥ 80%
- [ ] CLAUDE audit passed

### Integration Validation (NEW - MANDATORY)
- [ ] **Full-stack integration test passes**
  - Backend running on port 3001
  - Frontend running on port 5173+
  - E2E test navigates UI and calls API
  - No CORS errors in console
  - No type errors in network responses
  
- [ ] **Manual integration verification**
  - [ ] Started both services fresh
  - [ ] Executed at least 3 search queries
  - [ ] Screenshot of working UI attached to PR
  - [ ] Network tab shows successful API calls
  - [ ] Console shows zero errors

### Evidence Required
- [ ] E2E test output logged
- [ ] Screenshot of working feature attached
- [ ] API response sample saved to specs/
```

#### 2. Add Integration Test to CI/CD (BLOCKER)
```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [pull_request]

jobs:
  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start Backend
        run: |
          cd backend
          npm ci
          npm run build
          npm start &
          
      - name: Wait for Backend
        run: |
          timeout 30 bash -c 'until curl -f http://localhost:3001/health; do sleep 1; done'
          
      - name: Start Frontend
        run: |
          cd frontend
          npm ci
          npm run build
          npm run preview &
          
      - name: Run E2E Tests
        run: |
          cd e2e
          npm ci
          npx playwright test
          
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-screenshots
          path: e2e/test-results/
```

#### 3. Add Pre-Merge Integration Checklist Template
```markdown
## Integration Verification Report (Required for PR Approval)

**Date**: YYYY-MM-DD
**Tested By**: [Agent/Developer Name]
**Branch**: [branch-name]

### Services Started
- [ ] Backend started: `cd backend && npm run dev`
  - Port: 3001
  - CORS origins logged: [paste from terminal]
  
- [ ] Frontend started: `cd frontend && npm run dev`
  - Port: [actual port]
  - Base URL configured: [verify .env]

### Manual Test Scenarios
- [ ] Scenario 1: [e.g., Search for "red bird"]
  - Query: [paste query]
  - Results: [# of results returned]
  - Screenshot: [attach or link]
  
- [ ] Scenario 2: [different query]
  - Query: [paste query]
  - Results: [# of results returned]
  
- [ ] Scenario 3: [edge case]
  - Query: [paste query]
  - Results: [behavior]

### Browser Console Checks
- [ ] Zero CORS errors
- [ ] Zero type errors
- [ ] Zero network failures
- [ ] Screenshot of clean console attached

### API Contract Validation
```bash
curl -X POST http://localhost:3001/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}' | jq '.'
```
- [ ] Response structure matches frontend types
- [ ] Sample response saved to: `specs/[feature]/api-response-sample.json`

**Verification Status**: ✅ PASS | ❌ FAIL
**Issues Found**: [None | List issues]
**Reviewer Approval Required**: YES
```

## ⚠️ What Could Be Improved

### 0. Late Integration Issue Discovery (NEW - HIGHEST PRIORITY)
**Issue**: Integration problems discovered in demo, not during development  
**Impact**: User-facing failures, debugging under pressure  
**Root Cause**: No integration tests, no DoD enforcement, no E2E in CI/CD

**Action Items** (BLOCKING for next story):
- [ ] **BLOCKER**: Add E2E integration test to CI/CD pipeline
- [ ] **BLOCKER**: Update story completion checklist (integration validation required)
- [ ] **BLOCKER**: Create integration verification template for PRs
- [ ] Add "works integrated" to acceptance criteria template
- [ ] Require screenshot evidence before merge approval

### 1. Subagent Delegation Protocol
**Issue**: Subagent didn't always write completion reports to delegation file
**Impact**: Required manual verification and re-delegation
**Root Cause**: Instructions weren't explicit enough about file-based communication

**Action Items**:
- [ ] Update delegation template with clearer report requirements
- [ ] Add verification step after each delegation
- [ ] Consider structured JSON reports

### 2. Domain Knowledge Gaps
**Issue**: Cosine similarity range [-1, 1] not [0, 1] caused test failures
**Impact**: 2+ hours debugging
**Root Cause**: Assumed Euclidean similarity behavior

**Action Items**:
- [x] Created `vector-search` skill to capture this knowledge
- [ ] Add domain-specific context files for future features

### 3. Late Code Quality Review
**Issue**: CLAUDE audit happened after most implementation
**Impact**: Had to fix issues post-hoc

**Action Items**:
- [ ] Integrate quality gates at component level, not story level
- [ ] Run audit after each major component, not at end

### 4. No Formal Status Tracking
**Issue**: Progress tracking was ad-hoc
**Impact**: Hard to see overall status at a glance

**Action Items**:
- [x] Created story-tracker template
- [x] Created TDD compliance checklist
- [x] Created delegation brief template
- [x] Created CLAUDE audit checklist

## 🎓 Key Learnings

### Agent Feedback Summary (Collected via Subagent Consultation)

#### TDD Specialist
**Insight**: "TDD worked brilliantly for units but we had no INTEGRATION test discipline. Test pyramid was inverted: 272 unit, 0 integration, 0 E2E."

**Critical Recommendations**:
- Add contract tests against real backend API (not mocks) - HIGH
- E2E smoke test before merge mandatory - HIGH
- Create `.github/INTEGRATION_CHECKLIST.md` template - MEDIUM
- Apply TDD at integration level: Write failing integration test first

#### Fullstack Engineer
**Insight**: "Completed story without ever running `curl` against live backend while frontend was running. The 272 passing tests created false confidence with mocked data shaped to pass tests, not reflect reality."

**Critical Recommendations**:
- Generate TypeScript types from OpenAPI (backend = source of truth) - HIGH
- Contract-first workflow: OpenAPI → Generate types → Implement - HIGH
- Create `npm run dev:all` script for consistent port coordination - MEDIUM
- Add .js, .jsx to .gitignore in frontend/src - MEDIUM
- Manual verification checklist required before story completion - HIGH

#### Playwright Specialist
**Insight**: "E2E tests existed but the failure was **process**: no automation enforcement. No CI/CD pipeline, console errors ignored, no network validation."

**Critical Recommendations**:
- Create GitHub Actions E2E workflow - HIGH (BLOCKER)
- Add console error monitoring to all tests - HIGH
- Add network failure monitoring - HIGH
- Update DoD to require CI passing before merge - HIGH
- Enforce PR approval checklist with integration proof - HIGH

#### Code Quality Auditor
**Insight**: "CLAUDE audit had a **scope gap** - audited 'is code well-written?' not 'does it work when deployed?'. Code quality ≠ working software."

**Critical Recommendations**:
- Add CLAUDE category "I - Integration" with 5 rules - HIGH
- Require E2E test execution before audit approval - HIGH
- Add API Contract Validation using openapi-validator - MEDIUM
- Add "Integration Verification" section to audit report (with screenshot) - HIGH
- Block approval if no integration test exists for story - HIGH

#### Feature Lead
**Insight**: "Treated 'tests pass' as equivalent to 'ready for demo'. A story is complete when it demonstrably works in the integrated system, not when unit tests pass."

**Critical Recommendations**:
- Add mandatory gate: "Run backend + frontend together, verify browser can hit API" - HIGH
- Require integration evidence before approval (screenshot, curl, clean console) - HIGH
- Add "Cross-service integration requirements" to story template - HIGH
- Update completion checklist with visual evidence requirement - HIGH

**Proposed DoD Gates** (Mandatory Before Merge):
```markdown
- ✅ Integration smoke test: frontend + backend running together
- ✅ CORS verification: browser devtools shows no CORS errors
- ✅ Type contract test: real API response validates against shared types
- ✅ Clean build: rm -rf dist && npm run build produces working artifacts
- ✅ Visual evidence: screenshot/gif of feature working in browser
```

### Technical Learnings

| Learning | Category | Captured In |
|----------|----------|-------------|
| Cosine similarity range is [-1, 1], not [0, 1] | Vector Search | `skills/vector-search/` |
| Never log raw user queries (PII risk) | Security | `skills/secure-development/` |
| Test isolation requires beforeEach cleanup | Testing | `skills/tdd-workflow/` |
| TanStack Query caches by query key | Frontend | - |
| CORS must support dynamic port assignment (5173-5175) | Integration | `skills/integration-testing/` |
| API types must match wire format, not ideal design | Integration | `skills/integration-testing/` |
| Stale .js artifacts shadow .tsx sources | Build Hygiene | `skills/integration-testing/` |

### Process Learnings

| Learning | Category | Impact |
|----------|----------|--------|
| File-based delegation communication works | Delegation | Reliable handoff |
| Subagents need explicit report requirements | Delegation | Better completion |
| Quality gates should be continuous | Quality | Earlier issue detection |
| Templates reduce cognitive load | Process | Faster story execution |

## 📋 Recommendations for Next Story

### Before Starting
1. Copy and fill `story-tracker.template.md`
2. Copy and fill `tdd-compliance.checklist.md`
3. Review relevant skills for domain knowledge

### During Implementation
1. Use `delegation-brief.template.md` for every subagent task
2. Verify delegation completion reports are filed
3. Run CLAUDE audit after each major component

### Before Merge
1. Complete `claude-audit.checklist.md`
2. Verify all acceptance criteria with tests
3. Update story tracker with final metrics
4. Document learnings for skill updates

## 🔄 Action Items

### Immediate (Next Story)
- [ ] Use new templates from `.specify/templates/`
- [ ] More frequent quality gates
- [ ] Explicit subagent report verification

### Short-term (This Sprint)
- [ ] Update fullstack-engineer agent with new skills
- [ ] Add domain context files to birdmate
- [ ] Create pre-delegation verification prompt

### Long-term (Backlog)
- [ ] Automated test coverage reporting
- [ ] CI integration for CLAUDE audit
- [ ] Story metrics dashboard

---

## 🔧 Integration Demo Session (2025-12-25)

### Issues Discovered During Live Demo

#### 1. CORS Misconfiguration
**Problem**: Backend allowed only `http://localhost:5173`, but frontend was running on `5175`  
**Symptom**: `ERR_FAILED` network errors, CORS policy blocked requests  
**Root Cause**: Vite assigned different port due to 5173 being occupied  
**Fix Applied**: 
- Updated `.env` to support multiple origins: `5173,5174,5175`
- Modified [server.ts](../../../backend/src/server.ts#L22) to split comma-delimited origins

**Learning**: Development CORS config must accommodate dynamic port assignment

#### 2. API Response Mapping Mismatch
**Problem**: Frontend expected nested `result.bird.id`, backend returned flat `result.id`  
**Symptom**: `Cannot read properties of undefined (reading 'id')` error  
**Root Cause**: Shared types didn't match actual API response structure  
**Fix Applied**:
- Created `ApiSearchResult` interface in [useSearch.ts](../../../frontend/src/hooks/useSearch.ts#L18-L24)
- Updated `transformResults()` to map flat structure correctly
- Changed `data.total` to `data.totalCount` to match backend response

**Learning**: Type definitions must reflect actual wire format, not ideal design

#### 3. Stale Compiled JavaScript
**Problem**: Old `.js` files (`App.js`, `main.js`) loaded instead of `.tsx` files  
**Symptom**: Page showed "Foundation phase complete" placeholder instead of search UI  
**Root Cause**: Previous build artifacts not cleaned up  
**Fix Applied**: Removed `App.js` and `main.js` from `frontend/src/`

**Learning**: Add `.js` to `.gitignore` in TypeScript projects to prevent this

### Successes

✅ **Playwright MCP Integration** - Successfully used browser automation for live demo  
✅ **Natural Language Search Working** - Semantic search returned relevant results  
✅ **Quick Debugging** - Network inspection and console logs identified issues fast  
✅ **Real-time Fixes** - All issues resolved without backend restart (except CORS .env)

### Action Items for Agent Package Manager

**High Priority**:
1. Create `integration-testing` skill capturing CORS, type mapping, build artifacts patterns
2. Update `fullstack-expertise` instructions with API contract validation checklist
3. Add pre-demo validation prompt: check CORS config, type alignment, clean build

**Medium Priority**:
4. Document Playwright MCP demo workflow in `contexts/demo-best-practices.context.md`
5. Create `.gitignore` template enforcing no committed `.js` files in TypeScript projects

### Handoff Specification

```yaml
# specs/001-bird-search-ui/retro-handoff-integration.yml
story_id: US-001-integration-demo
retro_date: 2025-12-25
facilitator: retro-specialist

learnings:
  - category: integration
    what: "CORS must support dynamic port assignment in development"
    fix: "Multi-origin .env config pattern"
    priority: high
    
  - category: type-safety
    what: "Shared types diverged from actual API response structure"
    fix: "API-specific types at integration boundary"
    priority: high
    
  - category: build-hygiene
    what: "Compiled .js files shadowed .tsx sources"
    fix: "Gitignore + clean build verification"
    priority: medium

changes:
  # CRITICAL: Integration Testing Infrastructure (HIGHEST PRIORITY - BLOCKER)
  - type: instruction
    target: agent-packages/skills/tdd-workflow/.apm/instructions/integration-test-mandate.instructions.md
    action: create
    rationale: "CRITICAL: Prevent late integration issue discovery by making integration testing mandatory in DoD"
    priority: BLOCKER
    content_diff: |
      ---
      applyTo: "**"
      ---
      
      # Integration Testing Mandate (MANDATORY)
      
      ## Critical Learning: Why This Exists
      
      **US-001 passed all 272 tests, merged to main, but failed in user acceptance with 3 integration bugs.**
      
      This instruction prevents that from happening again.
      
      ## The Problem
      
      - ✅ Backend: 172 unit tests passed
      - ✅ Frontend: 100 unit tests passed  
      - ✅ Code reviewed and merged
      - ❌ **Nobody verified they work TOGETHER**
      
      **Result**: CORS errors, type mismatches, stale builds discovered in live demo.
      
      ## Mandatory Integration Checklist (BLOCKING for Merge)
      
      ### CI/CD Requirements (Must Pass Before Merge)
      
      ```yaml
      # .github/workflows/integration.yml (REQUIRED)
      integration-test:
        - Start backend (port 3001)
        - Wait for /health endpoint (200 OK)
        - Start frontend (port 5173)
        - Run Playwright E2E tests
        - Assert: Zero console errors
        - Assert: Zero network failures
        - Assert: At least 1 search succeeds
      ```
      
      ### Manual Verification (Evidence Required in PR)
      
      **Before requesting PR approval, developer MUST**:
      
      ```markdown
      ## Integration Verification ✅
      
      **Services Started**:
      - [ ] Backend: `cd backend && npm run dev` ✅ (port 3001)
      - [ ] Frontend: `cd frontend && npm run dev` ✅ (port: [actual])
      
      **Manual Test Scenarios** (minimum 3):
      1. Search: "red bird" → [X results] ✅ Screenshot: [link]
      2. Search: "blue crested" → [Y results] ✅  
      3. Edge case: "zzzzz" → [0 results, no crash] ✅
      
      **Browser Console**: [Screenshot showing ZERO errors] ✅
      **Network Tab**: [Screenshot showing 200 OK responses] ✅
      
      **API Contract Validation**:
      ```bash
      curl -X POST http://localhost:3001/api/v1/search \
        -H "Content-Type: application/json" \
        -d '{"query": "test"}' | jq '.' > specs/[story]/api-sample.json
      ```
      - [ ] Response structure saved ✅
      - [ ] Matches frontend types ✅
      ```
      
      **Without this section, PR MUST NOT be approved.**
      
      ## Updated Definition of Done
      
      ### Old (Insufficient)
      - ✅ Tests pass
      - ✅ Coverage ≥ 80%
      - ✅ Code reviewed
      
      ### New (Required)
      - ✅ Unit tests pass
      - ✅ Coverage ≥ 80%
      - ✅ **E2E integration test passing in CI**
      - ✅ **Manual integration verified (screenshot evidence)**
      - ✅ **Browser console clean (screenshot evidence)**
      - ✅ **API contract validated (curl sample saved)**
      - ✅ Code reviewed
      
      ## Common Integration Failures (From US-001)
      
      ### 1. CORS Misconfiguration
      **Symptom**: `Access-Control-Allow-Origin header has value 'http://localhost:5173' that is not equal to supplied origin`
      
      **Root Cause**: Backend hardcodes single port, dev server assigns different port
      
      **Prevention**:
      ```typescript
      // backend/.env
      CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
      
      // backend/src/server.ts  
      const CORS_ORIGINS = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim());
      app.use(cors({ origin: CORS_ORIGINS }));
      ```
      
      **Test**:
      ```bash
      # Terminal 1: Start backend
      cd backend && npm run dev | grep "CORS origins:"
      # Should show: ["http://localhost:5173", "http://localhost:5174", ...]
      
      # Terminal 2: Start frontend (may get 5174 or 5175)
      cd frontend && npm run dev
      
      # Browser: Open frontend URL
      # Console: Must show ZERO CORS errors
      ```
      
      ### 2. API Type Mismatch
      **Symptom**: `Cannot read properties of undefined (reading 'id')`
      
      **Root Cause**: Frontend expects `result.bird.id`, backend returns `result.id`
      
      **Prevention**:
      ```typescript
      // Validate contract in test BEFORE integration
      test('API structure matches frontend types', async () => {
        const response = await fetch('http://localhost:3001/api/v1/search', {
          method: 'POST',
          body: JSON.stringify({ query: 'test' })
        });
        const data: ApiResponse = await response.json();
        
        // These assertions prevent type drift
        expect(data.results[0]).toHaveProperty('id');  // NOT bird.id
        expect(data.results[0]).toHaveProperty('commonName');
        expect(data).toHaveProperty('totalCount');  // NOT total
      });
      ```
      
      ### 3. Stale Build Artifacts
      **Symptom**: UI shows old code after source changes
      
      **Root Cause**: Compiled `.js` files shadow `.tsx` sources
      
      **Prevention**:
      ```json
      // package.json
      {
        "scripts": {
          "clean": "find src/ -name '*.js' -o -name '*.jsx' | xargs rm -f",
          "prebuild": "npm run clean",
          "predev": "npm run clean"
        }
      }
      ```
      
      **Test**:
      ```bash
      # Verify no stale JS in TypeScript src/
      find src/ -name "*.js" -o -name "*.jsx" | grep -v node_modules
      # Should be empty
      ```
      
      ## Integration Test Template
      
      ```typescript
      // e2e/integration-smoke.spec.ts (REQUIRED for every feature)
      import { test, expect } from '@playwright/test';
      
      test.describe('Full Stack Integration', () => {
        test.beforeAll(async () => {
          // Verify backend is running
          const health = await fetch('http://localhost:3001/health');
          expect(health.ok).toBeTruthy();
        });
        
        test('user can complete primary user flow', async ({ page }) => {
          // Monitor console for errors
          const consoleErrors: string[] = [];
          page.on('console', msg => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text());
            }
          });
          
          // Execute user flow
          await page.goto('http://localhost:5173');
          await page.getByPlaceholder('Search...').fill('test query');
          await page.getByRole('button', { name: 'Search' }).click();
          
          // Verify success
          await expect(page.getByTestId('results')).toBeVisible();
          
          // Assert no integration errors
          expect(consoleErrors).toHaveLength(0);
          expect(consoleErrors.filter(e => e.includes('CORS'))).toHaveLength(0);
          expect(consoleErrors.filter(e => e.includes('undefined'))).toHaveLength(0);
        });
      });
      ```
      
      ---
      
      **Remember**: Unit tests prove components work. Integration tests prove THE SYSTEM works. Both are mandatory.
    validation: |
      1. Add integration checklist to next PR template
      2. Verify CI pipeline includes integration-tests job
      3. Check PR for screenshot evidence before approving
      4. Confirm no console/network errors in evidence
  
  # Integration Testing Skill
  - type: skill
    target: agent-packages/skills/integration-testing/SKILL.md
    action: create
    rationale: "Capture CORS, type mapping, and build artifact learnings"
    priority: high
    content_diff: |
      ---
      name: integration-testing
      description: Frontend-backend integration patterns, CORS configuration, API contract validation, and build hygiene for full-stack TypeScript applications
      ---
      
      # Integration Testing Skill
      
      ## CORS Development Configuration
      
      **Critical Pattern**: Development CORS must accommodate dynamic port assignment
      
      ```typescript
      // ❌ WRONG - Single hardcoded origin
      const CORS_ORIGIN = 'http://localhost:5173';
      
      // ✅ CORRECT - Support port range
      const CORS_ORIGINS = (process.env.CORS_ORIGIN || 
        'http://localhost:5173,http://localhost:5174,http://localhost:5175'
      ).split(',');
      
      app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
      ```
      
      **Why**: Vite/dev servers auto-increment ports when default is occupied
      
      ## API Contract Validation
      
      **Critical**: Types at integration boundary must match wire format
      
      ### Anti-Pattern: Over-abstraction
      ```typescript
      // Shared type (ideal design, not actual API)
      interface SearchResult {
        bird: Bird;  // ❌ Nested structure
        score: number;
      }
      ```
      
      ### Correct Pattern: Wire-format types
      ```typescript
      // API response types (match actual backend)
      interface ApiSearchResult {
        id: string;         // ✅ Flat structure
        commonName: string;
        score: number;
      }
      
      // Transform at boundary
      function transformResults(apiResults: ApiSearchResult[]): AppResult[] {
        return apiResults.map(api => ({ ... }));
      }
      ```
      
      **Validation Checklist**:
      - [ ] Test API endpoint with curl, inspect actual JSON
      - [ ] Create `Api*` types matching exact response structure
      - [ ] Transform to app types at integration boundary only
      - [ ] Never assume shared types match wire format
      
      ## Build Artifact Hygiene
      
      **Critical**: Compiled files must not shadow source files
      
      ### TypeScript Project .gitignore
      ```gitignore
      # Compiled outputs
      dist/
      build/
      *.js        # ⚠️ CRITICAL in src/ directories
      *.js.map
      
      # Exception: config files
      !vite.config.js
      !playwright.config.js
      ```
      
      **Pre-demo validation**:
      ```bash
      # Check for stale .js in src/
      find src/ -name "*.js" -type f
      
      # Should return empty or only intentional .js files
      ```
      
      ## Integration Testing Workflow
      
      1. **Start backend**: Verify CORS origins logged at startup
      2. **Start frontend**: Note actual port assigned
      3. **Test CORS preflight**: 
         ```bash
         curl -I -X OPTIONS http://localhost:3001/api/v1/search \
           -H "Origin: http://localhost:5175" \
           -H "Access-Control-Request-Method: POST"
         # Should return Access-Control-Allow-Origin: http://localhost:5175
         ```
      4. **Test API contract**:
         ```bash
         curl -X POST http://localhost:3001/api/v1/search \
           -H "Content-Type: application/json" \
           -d '{"query": "test"}' | jq '.'
         # Verify response structure matches frontend types
         ```
      5. **Browser network inspection**: Verify no CORS or type errors
      
      ## Common Failure Modes
      
      | Symptom | Root Cause | Fix |
      |---------|-----------|-----|
      | `ERR_FAILED` network | CORS misconfiguration | Add frontend port to backend CORS origins |
      | `Cannot read property 'x' of undefined` | Type mismatch | Create API-specific types at boundary |
      | Old UI showing | Stale .js files | Remove compiled artifacts from src/ |
      | Port already in use | Previous instance running | `lsof -ti:3001 \| xargs kill` |
      
      ## Pre-Demo Validation Checklist
      
      - [ ] Backend `.env` has CORS_ORIGIN with port range (5173-5175)
      - [ ] No `.js` files in `frontend/src/` or `backend/src/`
      - [ ] `curl` test confirms API response structure
      - [ ] Network tab shows successful OPTIONS + POST requests
      - [ ] Console shows no CORS or type errors
    validation: "Create sample full-stack project, trigger all 3 error conditions, verify skill prevents them"

  - type: instruction
    target: agent-packages/skills/fullstack-expertise/.apm/instructions/fullstack-standards.instructions.md
    action: update
    rationale: "Add integration validation to development standards"
    priority: high
    content_diff: |
      ## Integration Validation
      
      **Before merging any full-stack feature**:
      
      ### API Contract Verification
      ```bash
      # 1. Test actual API response
      curl -X POST http://localhost:3001/api/v1/endpoint \
        -H "Content-Type: application/json" \
        -d '{"test": "data"}' | jq '.' > actual-response.json
      
      # 2. Compare with frontend types
      # Frontend types MUST match actual-response.json structure
      ```
      
      ### CORS Development Checklist
      - [ ] Backend CORS config supports port range (not single port)
      - [ ] `.env.example` documents CORS_ORIGIN pattern
      - [ ] README documents required environment variables
      
      ### Build Hygiene
      - [ ] No `.js` files committed in `src/` directories
      - [ ] `.gitignore` excludes compiled outputs
      - [ ] `npm run build` works on clean checkout
    validation: "Use in next full-stack story (US-002), verify catches type mismatches"

  - type: context
    target: agent-packages/contexts/demo-best-practices.context.md
    action: create
    rationale: "Document Playwright MCP demo workflow for future feature demos"
    priority: medium
    content_diff: |
      # Demo Best Practices
      
      ## Playwright MCP Live Demo Workflow
      
      ### Pre-Demo Setup
      1. Start backend: `cd backend && npm run dev`
      2. Verify backend logs show correct CORS origins
      3. Start frontend: `cd frontend && npm run dev`
      4. Note actual frontend port (may not be 5173)
      5. Update backend CORS if needed
      
      ### Demo Script
      1. Navigate to app: `mcp_microsoft_pla_browser_navigate(url)`
      2. Take initial screenshot
      3. Type search query: `mcp_microsoft_pla_browser_type()`
      4. Click search: `mcp_microsoft_pla_browser_click()`
      5. Wait for results: `mcp_microsoft_pla_browser_wait_for()`
      6. Take results screenshot
      7. Repeat with 2-3 different queries
      
      ### Debugging Mid-Demo
      - Check console: `mcp_microsoft_pla_browser_console_messages(level='error')`
      - Inspect network: `mcp_microsoft_pla_browser_network_requests()`
      - View page state: `mcp_microsoft_pla_browser_snapshot()`
      
      ### Common Demo Failures
      | Issue | Quick Fix |
      |-------|-----------|
      | CORS error | Update backend .env, restart backend |
      | Type error | Check API response vs frontend types |
      | Stale UI | Remove .js files, hard refresh browser |
    validation: "Use this workflow for US-002 demo"

tracking:
  log_file: agent-packages/memory/retro-log.md
  version_bumps_required: true
  dependent_projects:
    - birdmate
  propagation_notes: |
    Integration testing skill is general-purpose and should propagate to:
    - Any full-stack TypeScript project
    - Projects with separate frontend/backend services
    - Development environments with dynamic port assignment
```

Save handoff spec to: `specs/001-bird-search-ui/retro-handoff-integration.yml`

---

**Retrospective Completed**: 2025-12-25  
**Integration Demo**: ✅ All 3 issues resolved, MVP functional  
**Handoff Created**: [retro-handoff-integration.yml](retro-handoff-integration.yml)  
**Handoff Implemented**: ✅ 2025-12-25 by Agent Package Manager  
**Skills Published**: 
- `integration-testing` v1.0.0 (new)
- `tdd-workflow` v1.2.0 → v1.3.0
- `fullstack-expertise` v1.0.0 → v1.1.0
- `demo-best-practices` context added
**Propagated to**: birdmate (commit 9a8e3e9), agent-packages (commits 20713af, badf7b5)  
**Next Action**: Apply integration testing mandate to US-002  
**Next Story**: US-002 (Bird Detail View) ready for delegation
