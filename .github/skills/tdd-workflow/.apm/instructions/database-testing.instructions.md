# Database Testing Standards

Apply these patterns when writing tests that interact with databases (SQLite, PostgreSQL, MySQL).

## Core Principle: Test Isolation with Shared Database State

**Problem**: Database state is mutable and shared across tests. Changes in one test affect subsequent tests.

**Solution**: Reset database state before or after each test.

---

## SQLite / Better-SQLite3 Patterns

### Pattern 1: Reseed Data in beforeEach

**Best for**: Small test datasets (< 100 rows)

```typescript
describe('BirdService', () => {
  let db: Database.Database;
  let service: BirdService;

  beforeAll(() => {
    db = new Database(':memory:'); // In-memory database
    db.exec(schema); // Create tables
  });

  beforeEach(() => {
    // Clear all data
    db.exec('DELETE FROM birds');
    
    // Reseed test data
    const insert = db.prepare('INSERT INTO birds (id, name) VALUES (?, ?)');
    insert.run('norcar', 'Northern Cardinal');
    insert.run('blujay', 'Blue Jay');
    insert.run('amegor', 'American Goldfinch');
  });

  afterAll(() => {
    db.close();
  });

  test('findById returns bird', () => {
    const bird = service.findById('norcar');
    expect(bird.name).toBe('Northern Cardinal');
  });
});
```

### Pattern 2: Transaction Rollback

**Best for**: Larger datasets, faster test execution

```typescript
describe('UserService', () => {
  let db: Database.Database;
  let transaction: any;

  beforeEach(() => {
    // Start transaction
    db.exec('BEGIN TRANSACTION');
  });

  afterEach(() => {
    // Rollback all changes
    db.exec('ROLLBACK');
  });

  test('create user', () => {
    service.createUser({ name: 'Alice' });
    // Changes will be rolled back after test
  });
});
```

### Pattern 3: Separate Database Per Test

**Best for**: Tests that modify schema or need complete isolation

```typescript
describe('Migration Tests', () => {
  let tempDir: string;
  let dbPath: string;
  let db: Database.Database;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'test-'));
    dbPath = join(tempDir, 'test.db');
    db = new Database(dbPath);
  });

  afterEach(() => {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('migration creates tables', () => {
    runMigration(db);
    // Each test gets fresh database
  });
});
```

---

## PostgreSQL / MySQL Patterns

### Pattern 1: Test Database with Truncate

```typescript
describe('PostgreSQL Tests', () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({
      database: 'test_db', // Separate test database
      // ...connection config
    });
  });

  beforeEach(async () => {
    // Truncate all tables (fast)
    await pool.query('TRUNCATE users, orders, products CASCADE');
    
    // Reseed
    await pool.query('INSERT INTO users (id, name) VALUES (1, \'Alice\')');
  });

  afterAll(async () => {
    await pool.end();
  });
});
```

### Pattern 2: Test Transactions

```typescript
describe('Transactional Tests', () => {
  let client: PoolClient;

  beforeEach(async () => {
    client = await pool.connect();
    await client.query('BEGIN');
  });

  afterEach(async () => {
    await client.query('ROLLBACK');
    client.release();
  });

  test('create user', async () => {
    await client.query('INSERT INTO users (name) VALUES ($1)', ['Bob']);
    // Automatically rolled back
  });
});
```

---

## Common Pitfalls

### Pitfall 1: Tests Run in Parallel, State Gets Corrupted

**Problem**:
```typescript
test('test A', () => {
  db.exec('UPDATE settings SET value = 1');
  // Test B might read this value!
});

test('test B', () => {
  const value = db.query('SELECT value FROM settings');
  expect(value).toBe(0); // Fails if test A ran first
});
```

**Solution**: Use `beforeEach()` to reset ALL state, or run tests sequentially.

### Pitfall 2: Forgetting to Clean Up Resources

**Problem**:
```typescript
test('query database', () => {
  const db = new Database('test.db');
  db.query('SELECT * FROM users');
  // ❌ Never closed, file handle leak
});
```

**Solution**: Use `afterEach()` or `afterAll()` to close connections.

```typescript
afterEach(() => {
  db?.close();
});
```

### Pitfall 3: Tests Depend on Insertion Order

**Problem**:
```typescript
test('get first user', () => {
  db.insert('users', { name: 'Alice' });
  db.insert('users', { name: 'Bob' });
  
  const first = db.query('SELECT * FROM users LIMIT 1');
  expect(first.name).toBe('Alice'); // May fail if order not guaranteed
});
```

**Solution**: Use explicit ordering or query by unique identifier.

```typescript
const first = db.query('SELECT * FROM users ORDER BY id LIMIT 1');
```

---

## Handling Test Data with Embeddings/BLOBs

**Challenge**: Tests need consistent binary data (embeddings, images)

**Pattern**: Helper function to generate deterministic test data

```typescript
describe('Embedding Tests', () => {
  // Helper to create deterministic embeddings
  const createEmbedding = (seed: number): Buffer => {
    const embedding = new Array(1536).fill(0).map((_, i) => 
      Math.sin(i * seed) * 0.1
    );
    return Buffer.from(new Float32Array(embedding).buffer);
  };

  beforeEach(() => {
    // Seed with consistent embeddings
    db.prepare('INSERT INTO birds (id, embedding) VALUES (?, ?)')
      .run('norcar', createEmbedding(1));
    db.prepare('INSERT INTO birds (id, embedding) VALUES (?, ?)')
      .run('blujay', createEmbedding(2));
  });

  test('similarity search', () => {
    const queryEmbedding = createEmbedding(1.1); // Similar to seed 1
    const results = service.search(queryEmbedding);
    expect(results[0].id).toBe('norcar'); // Closest match
  });
});
```

---

## When Tests Modify State Deliberately

**Scenario**: Testing that data persists across operations

**Pattern**: Make state modification explicit and restore after test

```typescript
test('data persists after update', () => {
  // 1. Record original state
  const originalCount = db.query('SELECT COUNT(*) FROM users').count;
  
  // 2. Modify state
  service.createUser({ name: 'Charlie' });
  
  // 3. Assert change
  const newCount = db.query('SELECT COUNT(*) FROM users').count;
  expect(newCount).toBe(originalCount + 1);
  
  // 4. Cleanup (or rely on afterEach)
});
```

---

## Checklist for Database Tests

Before writing database tests:
- [ ] Using `beforeEach()` to reset state?
- [ ] Using `afterEach()` or `afterAll()` to clean up connections?
- [ ] Tests independent (can run in any order)?
- [ ] Test database separate from development/production?
- [ ] Using transactions for rollback when possible?
- [ ] Generating deterministic test data (not random)?

---

**Remember**: Database state is shared and mutable. Always reset to known state before each test to ensure isolation and reliability.
