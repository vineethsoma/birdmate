---
description: Martin Fowler's refactoring catalog with incremental change patterns
  and test-driven refactoring discipline
metadata:
  apm_commit: unknown
  apm_installed_at: '2025-12-24T18:20:17.581344'
  apm_package: vineethsoma/agent-packages/skills/refactoring-patterns
  apm_version: 1.0.0
name: refactoring-patterns
---

# Refactoring Patterns

Comprehensive refactoring guide based on Martin Fowler's "Refactoring: Improving the Design of Existing Code."

## Core Principle

**Small Change → Test → Commit → Repeat**

Every refactoring must preserve existing behavior while improving code structure.

---

## The Refactoring Cycle

1. **Identify One Small, Isolated Change**
   - Extract a single method/function
   - Rename one variable for clarity
   - Eliminate one piece of duplication
   - Simplify one conditional
   - **ONE change at a time** (< 10 lines affected)

2. **Make the Change**
   - Preserve existing behavior (no new features)
   - Keep scope minimal

3. **Run All Tests Immediately**
   - ✅ Green? → Proceed to step 4
   - ❌ Red? → Revert immediately, try smaller change

4. **Commit the Change**
   - Descriptive message: "Refactor: extract calculateDiscount method"
   - Creates safety checkpoint for rollback

5. **Repeat** - Build on the previous improvement

---

## Safety Rules (Non-Negotiable)

- **NEVER** refactor without passing tests
- **NEVER** combine refactoring with new features
- **NEVER** make "just one more small change" without testing
- **ALWAYS** commit after each successful step
- **ALWAYS** have a working state to revert to
- **Maximum 15 minutes** per refactoring step (break down if longer)

---

## Red-Green-Refactor Discipline

```
RED    → Write failing test for new feature
GREEN  → Minimal code to pass test (can be ugly)
REFACTOR → Improve code in tiny increments (test after each)
         → ONLY when all tests are green
         → Commit after each improvement
```

---

## Refactoring Catalog

### Composing Methods

**Extract Method** - Create well-named method from code fragment
- Use when: Semantically dense code, different abstraction levels, replacing comments
- Don't use if: Cannot give a better name than current method
- Steps: Copy block → create method → test → replace with call → test → rename → test

**Inline Method** - Replace method call with method body
- Use when: Needless indirection, preparing for larger refactoring
- Don't use if: Subclass overrides the method

**Inline Temp** - Replace temp variable with direct method call
- Use when: Temp assigned from method call only once
- Often leads to: Replace Temp with Query

**Replace Temp with Query** - Extract expression to method, remove temp
- Use when: Expression used once, temp assigned once
- Benefit: Reduces method size, enables reuse

**Introduce Explaining Variable** - Put complex expression in temp with clear name
- Use when: Complex conditionals need clarity
- Alternative: Prefer Extract Method for recurring checks

**Split Temporary Variable** - Create separate temp for each assignment
- Use when: Temp reused for different purposes (not loop/accumulator)
- Identifies: Variables named temp, foo, x (poor names)

**Remove Assignments to Parameters** - Use temp instead of assigning to parameter
- Avoids: Confusion between pass-by-value and pass-by-reference
- Exception: Output parameters (use sparingly)

**Replace Method with Method Object** - Turn method into its own class
- Introduces: Command Pattern
- Use when: Long method with local variables preventing Extract Method

**Substitute Algorithm** - Replace algorithm with clearer/simpler one
- Select based on: Performance, succinctness, expressiveness
- **Must have tests** before substituting

### Moving Features Between Objects

**Move Method** - Move method to class that uses it most
- Use when: Method uses more features of another class

**Move Field** - Move field to class that uses it most

**Extract Class** - Create new class for subset of responsibilities
- Use when: Class doing work of two classes

**Inline Class** - Merge class into another when it's no longer pulling weight

**Hide Delegate** - Create method to hide delegation
- Encapsulates: Knowledge of other objects

**Remove Middle Man** - Call delegate directly when middle man is thin wrapper

### Organizing Data

**Replace Magic Number with Symbolic Constant**
- Turn literal numbers into named constants

**Encapsulate Field** - Make field private, provide accessors

**Encapsulate Collection** - Return read-only view, provide add/remove methods

**Replace Type Code with Class** - Replace integer codes with class
- Alternative: Use enums or type-safe enums

**Replace Type Code with Subclasses** - Turn codes into inheritance
- Use when: Behavior varies by type code

**Replace Type Code with State/Strategy** - Use State/Strategy pattern
- Use when: Type code changes during lifetime, or can't use subclasses

### Simplifying Conditional Expressions

**Decompose Conditional** - Extract condition and branches into methods
- Example: `if (date.before(SUMMER_START))` → `if (notSummer(date))`

**Consolidate Conditional Expression** - Combine conditions with same result
- Use logical operators to unify checks

**Consolidate Duplicate Conditional Fragments** - Move identical code outside conditional

**Remove Control Flag** - Use break, continue, or return instead of flag variable

**Replace Nested Conditional with Guard Clauses** - Use early returns
- Example: `if (!valid) return; // rest of method`

**Replace Conditional with Polymorphism** - Move conditional to subclass methods

**Introduce Null Object** - Replace null checks with null object
- Null object implements interface with do-nothing methods

**Introduce Assertion** - Make assumptions explicit
- Example: `assert(balance >= 0, "Balance cannot be negative")`

### Making Method Calls Simpler

**Rename Method** - Make name explain purpose

**Add Parameter** / **Remove Parameter** - Adjust parameter list

**Separate Query from Modifier** - Split methods that return value and change state

**Parameterize Method** - Use parameter instead of multiple similar methods

**Replace Parameter with Explicit Methods** - Create separate method for each value

**Preserve Whole Object** - Pass entire object instead of multiple values

**Replace Parameter with Method** - Remove parameter by calling method

**Introduce Parameter Object** - Group parameters into object

**Remove Setting Method** - Make field immutable after construction

**Hide Method** - Make method private if not used outside class

**Replace Constructor with Factory Method** - Return polymorphic type

**Replace Error Code with Exception** - Throw exception instead of returning code

**Replace Exception with Test** - Check condition first to avoid exception

### Dealing with Generalization

**Pull Up Field** / **Pull Up Method** - Move to superclass when identical in subclasses

**Push Down Field** / **Push Down Method** - Move to subclass when used only there

**Extract Subclass** - Create subclass for features used in some instances

**Extract Superclass** - Create superclass for common features

**Extract Interface** - Create interface when classes share subset of features

**Collapse Hierarchy** - Merge subclass into superclass when too similar

**Form Template Method** - Move invariant steps to superclass, override variants

**Replace Inheritance with Delegation** - Use composition when subclass uses only part of superclass

**Replace Delegation with Inheritance** - Make delegate a subclass if using all features

---

## Example: Incremental Application

**Bad Approach** (risky - batched changes):
```
// Extract 3 methods + rename 5 variables + reorganize imports
// Run tests → many failures → hard to debug
```

**Good Approach** (safe - incremental):
```
1. Extract calculateSubtotal() → test → commit
2. Extract calculateTax() → test → commit  
3. Extract calculateTotal() → test → commit
4. Rename 'amt' to 'amount' → test → commit
5. Rename 'calc' to 'calculate' → test → commit
```

---

## References

Based on Martin Fowler's "Refactoring: Improving the Design of Existing Code"
- https://refactoring.com/catalog/