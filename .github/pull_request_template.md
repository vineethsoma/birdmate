# [US-XXX] Story Title

## Summary
<!-- Brief description of what this PR implements -->

## Acceptance Criteria
<!-- Copy from story spec and check off completed items -->
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Quality Gates

### Implementation
- [ ] All code follows CLAUDE Framework standards
- [ ] Error handling is comprehensive
- [ ] No commented-out code
- [ ] Self-documenting with clear intent

### Testing
- [ ] Backend tests passing (coverage: __%)
- [ ] Frontend tests passing (coverage: __%)
- [ ] Integration tests passing
- [ ] E2E tests passing

### Integration Verification
<!-- MANDATORY: Evidence that frontend and backend work together -->
- [ ] CORS configured correctly
- [ ] API response types match frontend expectations
- [ ] Console clean (no errors)
- [ ] Network requests succeed

### Code Quality
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] Build succeeds

---

## Test Results

### Backend
```
npm run test --coverage
# Paste results here
```

### Frontend
```
npm run test --coverage
# Paste results here
```

### E2E
```
npm run test:e2e
# Paste results here
```

---

## Integration Evidence

### UI Screenshots
<!-- Upload before/after screenshots from e2e/evidence/ -->
| Before | After |
|--------|-------|
| ![before](url) | ![after](url) |

### Console Logs
```
<!-- Paste clean browser console output -->
```

### Network Activity
```json
// API Request
POST /api/birds/search
{ "query": "example query" }

// API Response (200 OK)
{ "results": [...] }
```

---

## Agent Reviews

### TDD Specialist
- [ ] Reviewed and approved
- Coverage: __% (minimum 80%)
- Label: `tdd-approved`

### Code Quality Auditor
- [ ] Reviewed and approved
- CLAUDE Framework: Compliant
- Label: `quality-approved`

### Feature Lead
- [ ] Final approval
- All quality gates passed
- Label: `ready-for-acceptance`

---

## Human Acceptance
<!-- For Product Owner/Stakeholder -->
- [ ] Implementation matches business intent
- [ ] Acceptance criteria verified in running app
- [ ] Ready to merge

---

## Related
- Story Spec: `specs/XXX/spec.md`
- Plan: `specs/XXX/plan.md`
- Tasks: `specs/XXX/tasks.md`
