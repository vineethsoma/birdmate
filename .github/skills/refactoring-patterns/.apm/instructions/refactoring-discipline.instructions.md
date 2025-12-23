---
applyTo: "**"
description: Small-change refactoring discipline following Martin Fowler's patterns
---

# Refactoring Discipline

Apply incremental refactoring with test-driven discipline: Small Change → Test → Commit → Repeat.

## Core Principle

**Preserve behavior while improving structure**

Refactoring is NOT:
- ❌ Adding new features
- ❌ Fixing bugs
- ❌ Changing behavior

Refactoring IS:
- ✅ Improving code organization
- ✅ Clarifying intent
- ✅ Reducing complexity
- ✅ Making code easier to understand and modify

## The Refactoring Cycle

```
1. Identify small change (< 10 lines)
2. Make the change
3. Run ALL tests (must pass)
4. Commit
5. Repeat
```

**NEVER make multiple refactorings without testing between each one**

## Refactoring Safety Rules

**Rule 1: Tests Must Exist**
- No refactoring without test coverage
- If no tests exist, write characterization tests first
- Tests document current behavior (even if buggy)

**Rule 2: One Change at a Time**
- Extract ONE method
- Rename ONE variable
- Eliminate ONE duplication
- Not all three at once

**Rule 3: Test After Every Change**
- Run full test suite
- All tests must pass
- No "I'll test after I'm done"

**Rule 4: Commit Frequently**
- Commit after each successful refactor
- Small commits = easy to revert
- Commit message: "Refactor: [what you did]"

**Rule 5: If Tests Fail, Revert**
- Don't debug refactoring failures
- Revert to last green state
- Try smaller change

## Common Refactoring Patterns

### Extract Method
**When**: Function is too long or has complex logic

**Before**:
```python
def process_order(order):
    # Validate order
    if not order.items:
        raise ValueError("Order has no items")
    if order.total < 0:
        raise ValueError("Invalid total")
    
    # Calculate discount
    discount = 0
    if order.customer.is_premium:
        discount = order.total * 0.1
    
    # Apply payment
    final_total = order.total - discount
    order.customer.charge(final_total)
```

**After**:
```python
def process_order(order):
    validate_order(order)
    discount = calculate_discount(order)
    charge_customer(order, discount)

def validate_order(order):
    if not order.items:
        raise ValueError("Order has no items")
    if order.total < 0:
        raise ValueError("Invalid total")

def calculate_discount(order):
    if order.customer.is_premium:
        return order.total * 0.1
    return 0

def charge_customer(order, discount):
    final_total = order.total - discount
    order.customer.charge(final_total)
```

**Steps**:
1. Extract `validate_order()` → Test → Commit
2. Extract `calculate_discount()` → Test → Commit
3. Extract `charge_customer()` → Test → Commit

### Rename Variable/Function
**When**: Name doesn't clearly express intent

**Before**:
```python
def calc(x, y):
    return x * y * 0.2
```

**After**:
```python
def calculate_sales_tax(subtotal, tax_rate):
    return subtotal * tax_rate * 0.2
```

### Introduce Explaining Variable
**When**: Complex expression is hard to understand

**Before**:
```python
if (user.age >= 18 and user.country == "US") or user.has_parental_consent:
    allow_registration()
```

**After**:
```python
is_adult_in_us = user.age >= 18 and user.country == "US"
can_register = is_adult_in_us or user.has_parental_consent

if can_register:
    allow_registration()
```

### Replace Magic Number with Constant
**When**: Unexplained literal values

**Before**:
```python
def calculate_shipping(weight):
    if weight < 5:
        return 4.99
    return 9.99
```

**After**:
```python
LIGHTWEIGHT_THRESHOLD_LBS = 5
LIGHTWEIGHT_SHIPPING_COST = 4.99
STANDARD_SHIPPING_COST = 9.99

def calculate_shipping(weight):
    if weight < LIGHTWEIGHT_THRESHOLD_LBS:
        return LIGHTWEIGHT_SHIPPING_COST
    return STANDARD_SHIPPING_COST
```

### Consolidate Duplicate Code
**When**: Same logic appears in multiple places

**Before**:
```python
def format_user_email(user):
    return f"{user.first_name} {user.last_name} <{user.email}>"

def format_admin_email(admin):
    return f"{admin.first_name} {admin.last_name} <{admin.email}>"
```

**After**:
```python
def format_email_address(person):
    return f"{person.first_name} {person.last_name} <{person.email}>"
```

### Simplify Conditional
**When**: Complex nested conditionals

**Before**:
```python
def can_approve_expense(user, amount):
    if user.role == "manager":
        if amount < 1000:
            return True
        else:
            if user.department == "executive":
                return True
    return False
```

**After**:
```python
def can_approve_expense(user, amount):
    if user.role != "manager":
        return False
    
    if amount < 1000:
        return True
    
    return user.department == "executive"
```

### Replace Conditional with Polymorphism
**When**: Type checking with if/switch statements

**Before**:
```python
def calculate_pay(employee):
    if employee.type == "salaried":
        return employee.monthly_salary
    elif employee.type == "hourly":
        return employee.hours * employee.rate
    elif employee.type == "commissioned":
        return employee.base_salary + employee.commission
```

**After**:
```python
class SalariedEmployee:
    def calculate_pay(self):
        return self.monthly_salary

class HourlyEmployee:
    def calculate_pay(self):
        return self.hours * self.rate

class CommissionedEmployee:
    def calculate_pay(self):
        return self.base_salary + self.commission
```

## Refactoring Red Flags

**🚫 Large Multi-Step Refactoring**
- If you can't commit within 15 minutes, change is too big
- Break into smaller steps

**🚫 Tests Failing Mid-Refactor**
- Revert immediately
- Don't try to "fix it"
- Try smaller change

**🚫 Mixing Refactoring with Features**
- Separate commits: refactor OR feature, not both
- Refactor first, then add feature with tests

**🚫 Refactoring Without Tests**
- STOP
- Write characterization tests first
- Then refactor with safety

## When to Refactor

**Before adding a feature**:
- Makes space for new feature
- "Make the change easy, then make the easy change" - Kent Beck

**During code review**:
- Improve clarity for reviewers
- Extract complex logic
- Improve naming

**When you notice duplication** (Rule of Three):
- First time: write code
- Second time: note duplication
- Third time: refactor to remove duplication

**When you notice code smells**:
- Long methods (> 20 lines)
- Complex conditionals (> 3 nested levels)
- Duplicated code
- Large classes (> 500 lines)
- Long parameter lists (> 4 parameters)

## When NOT to Refactor

**On buggy code**:
- Fix bug first with tests
- Then refactor

**Near a deadline**:
- Refactoring can wait
- Don't risk breaking working code

**On code you don't understand**:
- Study code first
- Write tests to understand behavior
- Then refactor

**On third-party code**:
- Can't control upstream changes
- Wrap and adapt instead

---

**Remember**: Small Change → Test → Commit. Never compromise on testing between refactorings.
