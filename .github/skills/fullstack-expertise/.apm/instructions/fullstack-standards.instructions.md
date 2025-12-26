---
applyTo: "src/**,api/**,frontend/**,backend/**"
description: Full-stack development standards across frontend, backend, database, and DevOps
---

# Full-Stack Development Standards

Apply production-ready practices across the entire application stack.

## Backend Development

### API Design
- Use RESTful conventions: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
- Resource-based URLs: `/api/users/{id}`, not `/api/getUserById`
- Proper HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- Versioning in URL: `/api/v1/users` or header: `Accept: application/vnd.api+json; version=1`

### Error Handling
- Return consistent error format:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Email format invalid",
      "field": "email"
    }
  }
  ```
- Use appropriate status codes
- Log errors server-side with request context

### Security
- Input validation on all API endpoints
- Authentication (JWT, OAuth2)
- Authorization (RBAC, permissions)
- Rate limiting
- CORS configuration
- Secure password storage (bcrypt, Argon2)

## Frontend Development

### Component Architecture
- Single Responsibility: One component, one purpose
- Props for configuration, state for interaction
- Lift state up to common ancestor
- Use composition over prop drilling

### State Management
- Local state for UI-only (open/closed, form input)
- Global state for shared data (user, app settings)
- Server state separate from client state
- Optimize re-renders

### Accessibility (a11y)
- Semantic HTML: `<button>`, `<nav>`, `<main>`, `<article>`
- ARIA labels for screen readers
- Keyboard navigation support
- Color contrast ratios (WCAG AA minimum)
- Focus management

### Performance
- Code splitting and lazy loading
- Image optimization
- Minimize bundle size
- Virtual scrolling for long lists
- Memoization for expensive calculations

## Database

### Schema Design
- Normalized structure (avoid redundancy)
- Appropriate data types
- Constraints: NOT NULL, UNIQUE, CHECK
- Foreign keys for referential integrity

### Indexing
- Index frequently queried columns
- Composite indexes for multi-column queries
- Monitor slow queries

### Transactions
- ACID properties for critical operations
- Isolation levels appropriate to use case
- Rollback on errors

### Performance
- Connection pooling
- Query optimization
- Avoid N+1 queries
- Use pagination for large datasets

## DevOps & Deployment

### Environment Management
- Development, Staging, Production environments
- Environment variables for configuration
- Never commit secrets to version control

### CI/CD
- Automated testing on every commit
- Linting and type checking in pipeline
- Automated deployment to staging
- Manual approval for production

### Monitoring
- Application logs (structured JSON)
- Error tracking (Sentry, Rollbar)
- Performance monitoring (APM tools)
- Health check endpoints

### Containerization
- Dockerfile for consistent environments
- Multi-stage builds for smaller images
- Docker Compose for local development

## Integration Validation

**Before merging any full-stack feature**:

### API Contract Verification
```bash
# 1. Test actual API response
curl -X POST http://localhost:3001/api/v1/endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' | jq '.' > specs/[story]/actual-response.json

# 2. Compare with frontend types
# Frontend types MUST match actual-response.json structure exactly
```

**Contract Testing Checklist**:
- [ ] API endpoint tested with curl (not just mocked in tests)
- [ ] Actual response structure saved to specs/ directory
- [ ] Frontend types match actual response (not ideal design)
- [ ] Type transformation happens at integration boundary only

### CORS Development Checklist
- [ ] Backend CORS config supports port range (not single port)
  ```typescript
  // ✅ CORRECT
  const CORS_ORIGINS = (process.env.CORS_ORIGIN || 
    'http://localhost:5173,http://localhost:5174,http://localhost:5175'
  ).split(',').map(s => s.trim());
  ```
- [ ] `.env.example` documents CORS_ORIGIN pattern
- [ ] README documents required environment variables
- [ ] CORS origins logged at server startup for debugging
- [ ] OPTIONS preflight tested from actual frontend port

### Build Hygiene
- [ ] No `.js` or `.jsx` files committed in `src/` directories
- [ ] `.gitignore` excludes compiled outputs
  ```gitignore
  src/**/*.js
  src/**/*.jsx
  dist/
  build/
  ```
- [ ] `npm run build` works on clean checkout
- [ ] Package.json includes clean script:
  ```json
  {
    "scripts": {
      "clean": "find src/ -name '*.js' -o -name '*.jsx' | xargs rm -f",
      "prebuild": "npm run clean"
    }
  }
  ```

### Integration Testing Requirements
- [ ] E2E test with both services running
- [ ] Console error monitoring in E2E tests
- [ ] Network failure monitoring in E2E tests
- [ ] Manual verification with screenshot evidence
- [ ] Zero CORS errors in browser console
- [ ] Zero type errors in network responses

---

**Remember**: Full-stack means owning quality at every layer, especially at integration boundaries.
