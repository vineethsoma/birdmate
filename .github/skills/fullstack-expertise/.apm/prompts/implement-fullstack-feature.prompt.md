---
description: Implement full-stack feature with API and frontend
tags: [fullstack, api, frontend, implementation]
---

# Implement Full-Stack Feature

Build a complete feature spanning backend API and frontend UI with proper architecture.

## Instructions

You are a **Full-Stack Engineer**. Implement features across the entire application stack.

### Step 1: Plan the Feature

**Define Requirements**:
- What data needs to be stored/retrieved?
- What API endpoints are needed?
- What UI components are required?
- What edge cases exist?

**Architecture Decision**:
```markdown
## Feature: [Name]

**Backend**:
- Endpoints: [List REST endpoints]
- Database: [Tables/collections needed]
- Validation: [Input rules]

**Frontend**:
- Components: [UI components]
- State: [What state to manage]
- API Integration: [How to call backend]

**Error Handling**:
- Backend: [Error responses]
- Frontend: [Error display]
```

### Step 2: Implement Backend First

**Database Schema**:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoint** (with tests):
```python
@router.post("/api/users", status_code=201)
def create_user(user: UserCreate, db: Session):
    # Validate
    if not user.email:
        raise HTTPException(400, "Email required")
    
    # Create
    db_user = User(email=user.email)
    db.add(db_user)
    db.commit()
    
    return UserResponse.from_orm(db_user)
```

**Test First** (TDD):
```python
def test_createUser_validData_returns201():
    response = client.post("/api/users", json={"email": "test@example.com"})
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
```

### Step 3: Implement Frontend

**API Client**:
```typescript
export async function createUser(email: string): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  
  return response.json();
}
```

**Component**:
```tsx
function UserForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await createUser(email);
      alert('User created!');
    } catch (err) {
      setError('Failed to create user. Please try again.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Create User</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### Step 4: Integration Testing

Test the full flow:
```python
def test_userCreation_endToEnd():
    # API call
    response = client.post("/api/users", json={"email": "test@example.com"})
    assert response.status_code == 201
    
    # Database verification
    user = db.query(User).filter_by(email="test@example.com").first()
    assert user is not None
    
    # API retrieval
    get_response = client.get(f"/api/users/{user.id}")
    assert get_response.json()["email"] == "test@example.com"
```

### Step 5: Error Handling

**Backend error responses**:
```python
try:
    user = create_user(data)
except ValidationError as e:
    raise HTTPException(400, detail={"error": "VALIDATION_ERROR", "message": str(e)})
except DatabaseError:
    raise HTTPException(500, detail={"error": "DATABASE_ERROR", "message": "Failed to save user"})
```

**Frontend error display**:
```tsx
catch (err) {
  if (err.response?.status === 400) {
    setError("Please check your input");
  } else {
    setError("Server error. Please try again later.");
  }
}
```

## Full-Stack Checklist

**Backend**:
- ✅ Database schema created
- ✅ API endpoints implemented
- ✅ Input validation
- ✅ Error handling
- ✅ Tests pass (unit + integration)

**Frontend**:
- ✅ Components implemented
- ✅ API integration working
- ✅ Error states displayed
- ✅ Loading states shown
- ✅ Accessibility (keyboard, screen readers)

**Integration**:
- ✅ End-to-end flow tested
- ✅ Error cases handled
- ✅ Performance acceptable
- ✅ Security validated

---

**Remember**: Build API first with tests, then integrate frontend. Test the full stack.
