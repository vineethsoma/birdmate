---
applyTo: "**"
description: "Integration testing patterns for full-stack development"
---

# Integration Testing Standards

Apply these standards when working with full-stack applications where frontend and backend run as separate services.

## Mandatory Pre-Integration Checks

### CORS Configuration Validation
- Backend MUST support multiple origins (port range)
- Environment variable MUST be comma-separated list
- Startup logs SHOULD show configured origins
- OPTIONS preflight MUST succeed from all configured origins

### API Contract Verification
- Test API endpoint with `curl` before frontend integration
- Create separate interface types for API responses (`Api*Result`)
- Frontend types MAY differ from API types (transform at boundary)
- Save actual API response sample to specs/ directory

### Build Artifact Hygiene
- NO compiled `.js` or `.jsx` files in `src/` directories
- Add build artifacts to `.gitignore`
- Run `npm run clean` before builds
- Verify fresh build with `find src/ -name "*.js"`

## Integration Test Requirements

Every full-stack feature MUST have:

1. **Unit tests** (many) - Test components in isolation
2. **Contract tests** (some) - Validate API structure matches frontend types
3. **Integration tests** (few) - Full stack with both services running
4. **Manual verification** - Visual evidence with screenshots

## Common Anti-Patterns

❌ **Single hardcoded CORS origin**:
```typescript
const CORS_ORIGIN = 'http://localhost:5173'; // Breaks when Vite uses 5174
```

✅ **Multi-origin support**:
```typescript
const CORS_ORIGINS = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim());
```

❌ **Assuming shared types match API**:
```typescript
interface SearchResult {
  bird: { id: string };  // Frontend expects this
}
// But API returns: { id: string, ... } (flat structure)
```

✅ **Separate API types**:
```typescript
interface ApiSearchResult { id: string; ... }  // Matches API
interface SearchResult { bird: { id: string } }  // App-level
// Transform at boundary
```

❌ **Committing compiled files**:
```bash
git add src/App.js  # Shadows App.tsx!
```

✅ **Gitignore build artifacts**:
```gitignore
src/**/*.js
src/**/*.jsx
```

## Definition of Done (Integration)

A full-stack story is NOT complete until:

- [ ] Unit tests pass (backend + frontend)
- [ ] Integration E2E test passes
- [ ] Manual verification with both services running
- [ ] Screenshot evidence attached to PR
- [ ] Browser console clean (zero errors)
- [ ] Network tab shows successful API calls
- [ ] API response structure validated with curl

---

**Remember**: Unit tests prove components work. Integration tests prove THE SYSTEM works. Both are mandatory.
