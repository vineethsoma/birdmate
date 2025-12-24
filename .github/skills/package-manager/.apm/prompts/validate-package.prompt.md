---
description: Validate APM package structure and diagnose issues
tags: [package-management, validation, troubleshooting]
---

# Validate Package Structure

Diagnose and fix APM package structure issues to ensure validation passes.

## Instructions

You are an **Agent Package Manager**. Validate package structure and fix issues.

### Step 1: Run Structure Diagnostics

**Check Package Root**:
```bash
# Navigate to package
cd path/to/package

# Check for required files
ls -la | grep -E "(SKILL.md|apm.yml)"

# Expected output:
# SKILL.md
# apm.yml
```

**Check .apm/ Directory**:
```bash
# List .apm/ subdirectories
ls -la .apm/

# Expected output:
# instructions/
# prompts/
# agents/
# contexts/  (optional)
# memory/    (optional)
```

**Check for Content**:
```bash
# Critical: Check for .md files in subdirectories
find .apm -type f -name "*.md"

# Expected output:
# .apm/instructions/something.instructions.md
# .apm/prompts/something.prompt.md
# etc.

# If output is empty: VALIDATION WILL FAIL
```

### Step 2: Validate File Locations

**SKILL.md Location**:
```bash
# CORRECT: At package root
package/SKILL.md

# WRONG: Inside .apm/
package/.apm/skills/SKILL.md  # ❌
```

**Verification**:
```bash
# This should return the file
find package -maxdepth 1 -name "SKILL.md"

# This should return nothing
find package/.apm -name "SKILL.md"
```

### Step 3: Validate File Naming

**Check Naming Conventions**:
```bash
# Instructions should end with .instructions.md
find .apm/instructions -name "*.instructions.md"

# Prompts should end with .prompt.md
find .apm/prompts -name "*.prompt.md"

# Agents should end with .agent.md
find .apm/agents -name "*.agent.md"

# Contexts should end with .context.md
find .apm/contexts -name "*.context.md"

# Memory should end with .memory.md
find .apm/memory -name "*.memory.md"
```

**Common Mistakes**:
- ❌ `my-file.md` (missing type suffix)
- ✅ `my-file.instructions.md` (correct)

### Step 4: Validate File Content

**Check Frontmatter**:
```bash
# Instructions must have applyTo
head -n 5 .apm/instructions/*.instructions.md
# Should show:
# ---
# applyTo: "**"
# description: ...
# ---

# Prompts must have description
head -n 5 .apm/prompts/*.prompt.md
# Should show:
# ---
# description: ...
# ---

# Agents must have name and description
head -n 5 .apm/agents/*.agent.md
# Should show:
# ---
# name: ...
# description: ...
# ---
```

### Step 5: Test Local Installation

**Validate with APM**:
```bash
# From another project
cd /path/to/test-project

# Install package locally (use absolute path)
apm install /absolute/path/to/package

# Success indicators:
# ✓ No errors
# ✓ Package appears in .github/ or .claude/
# ✓ Primitives integrated
```

**Check Integration**:
```bash
# Prompts should be copied
ls -la .github/prompts/*-apm.prompt.md

# Agents should be copied
ls -la .github/agents/*-apm.agent.md

# Skills should be referenced
ls -la .github/skills/
```

### Step 6: Common Issues and Fixes

**Issue: "Missing required directory: .apm/"**

**Diagnosis**:
```bash
# Check if .apm/ exists
ls -la | grep ".apm"

# Check if .apm/ has content
find .apm -type f -name "*.md"
```

**Fix**:
```bash
# If .apm/ is empty, add at least one primitive
cat > .apm/instructions/main.instructions.md << 'EOF'
---
applyTo: "**"
description: Main instructions for this package
---

# Standards

[Add content]
EOF
```

**Issue: "Package not discovered"**

**Diagnosis**:
```bash
# Check for SKILL.md or apm.yml at root
ls -la | grep -E "(SKILL.md|apm.yml)"

# Check if SKILL.md is in wrong location
find . -name "SKILL.md"
```

**Fix**:
```bash
# If SKILL.md is in .apm/, move it
mv .apm/skills/SKILL.md ./SKILL.md

# If missing, create it
cat > SKILL.md << 'EOF'
---
name: package-name
description: Package description
type: skill
---
# Package Name
[Content]
EOF
```

**Issue: "Invalid apm.yml"**

**Diagnosis**:
```bash
# Check YAML syntax
cat apm.yml

# Should be valid YAML
```

**Fix**:
```bash
# Ensure proper YAML format
cat > apm.yml << 'EOF'
name: package-name
version: 1.0.0
description: Package description
type: skill
EOF
```

**Issue: "Primitives not integrating"**

**Diagnosis**:
```bash
# Check if primitives have correct extensions
find .apm -type f

# Should show:
# .instructions.md
# .prompt.md
# .agent.md
```

**Fix**:
```bash
# Rename files with proper extensions
mv .apm/prompts/my-prompt.md .apm/prompts/my-prompt.prompt.md
mv .apm/agents/my-agent.md .apm/agents/my-agent.agent.md
```

### Step 7: Generate Validation Report

**Package Structure Report**:
```markdown
## Validation Report: [Package Name]

### Structure ✅/❌
- [ ] SKILL.md at root
- [ ] apm.yml at root
- [ ] .apm/ directory exists
- [ ] At least one .md file in .apm/ subdirectories

### File Naming ✅/❌
- [ ] Instructions use .instructions.md
- [ ] Prompts use .prompt.md
- [ ] Agents use .agent.md

### Content ✅/❌
- [ ] SKILL.md has valid frontmatter
- [ ] apm.yml is valid YAML
- [ ] Primitives have frontmatter

### Integration ✅/❌
- [ ] Local install succeeds
- [ ] Primitives integrate to .github/
- [ ] No validation errors

### Issues Found
[List any issues]

### Fixes Applied
[List fixes]

### Next Steps
[What to do next]
```

## Validation Checklist

**Package Root**:
- [ ] SKILL.md exists at root (not in .apm/)
- [ ] apm.yml exists at root
- [ ] .apm/ directory exists
- [ ] At least one subdirectory in .apm/

**Primitive Content**:
- [ ] At least one .md file in .apm/ subdirectories
- [ ] Files follow naming conventions
- [ ] Files have valid frontmatter
- [ ] Content is non-empty

**Integration**:
- [ ] `apm install /path/to/package` succeeds
- [ ] Primitives copy to .github/ or .claude/
- [ ] No errors in APM output

**Git**:
- [ ] Files are tracked (not in .gitignore)
- [ ] Committed and pushed
- [ ] Remote install succeeds

## Troubleshooting Decision Tree

```
Package validation failing?
│
├─ "Missing required directory: .apm/"
│  └─ Check: Does .apm/ have .md files?
│     ├─ No → Add at least one primitive file
│     └─ Yes → Check if files have correct extensions
│
├─ "Package not discovered"
│  └─ Check: Is SKILL.md at root?
│     ├─ No → Move or create SKILL.md at root
│     └─ Yes → Check apm.yml exists
│
├─ "Primitives not integrating"
│  └─ Check: Do files have proper extensions?
│     ├─ No → Rename: .md → .instructions.md / .prompt.md
│     └─ Yes → Check frontmatter format
│
└─ "Unknown error"
   └─ Run full diagnostic and check logs
```

## Example: Fixing Empty Package

**Before** (fails validation):
```
skills/my-skill/
├── SKILL.md
├── apm.yml
└── .apm/
    ├── instructions/    # EMPTY
    ├── prompts/         # EMPTY
    └── agents/          # EMPTY
```

**After** (passes validation):
```
skills/my-skill/
├── SKILL.md
├── apm.yml
└── .apm/
    ├── instructions/
    │   └── main.instructions.md  # Added content
    ├── prompts/
    │   └── workflow.prompt.md    # Added content
    └── agents/
        └── specialist.agent.md   # Added content
```

**Fix Commands**:
```bash
cd skills/my-skill

# Add instruction
cat > .apm/instructions/main.instructions.md << 'EOF'
---
applyTo: "**"
description: Main standards
---
# Standards
[Content]
EOF

# Add prompt
cat > .apm/prompts/workflow.prompt.md << 'EOF'
---
description: Main workflow
---
# Workflow
[Content]
EOF

# Add agent
cat > .apm/agents/specialist.agent.md << 'EOF'
---
name: Specialist
description: Expert in this domain
---
# Specialist
[Content]
EOF

# Validate
cd /path/to/test-project
apm install /path/to/agent-packages/skills/my-skill
# ✅ Should succeed now
```

---

**Remember**: Empty .apm/ directories = validation failure. Always add content files.
