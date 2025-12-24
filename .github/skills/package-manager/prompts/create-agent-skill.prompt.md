---
description: Create a new skill following Agent Skills specification
tags: [skill-creation, agent-skills, scaffolding]
tools: ['read', 'edit', 'execute', 'search']
---

# Create Agent Skill

Create a new skill package following the Agent Skills specification (agentskills.io).

## Overview

This workflow creates a compliant Agent Skill with:
- Proper `SKILL.md` with valid frontmatter
- Optional directories (scripts/, references/, assets/)
- Progressive disclosure structure
- Validation using skills-ref

## Step 1: Gather Skill Requirements

**Ask the user**:

1. **Skill name** (lowercase, hyphens only, 1-64 chars)
   - Example: "pdf-processing", "data-analysis"
   
2. **What does it do?** (clear, specific description)
   - Should answer: "What does this skill accomplish?"
   
3. **When to use it?** (keywords, scenarios)
   - Should answer: "When would an agent activate this skill?"

4. **Does it need**:
   - Scripts? (executable code)
   - References? (detailed documentation)
   - Assets? (templates, data files)

5. **Optional metadata**:
   - License? (default: omit)
   - Author/organization?
   - Version? (default: 1.0)
   - Compatibility requirements? (system packages, network, etc.)

### Validation Gate 🚦

**STOP and validate name**:
```bash
# Name must match pattern: [a-z0-9][a-z0-9-]{0,62}[a-z0-9]
echo "skill-name" | grep -E '^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$'
```

**If validation fails**:
- ❌ No uppercase letters
- ❌ No underscores
- ❌ Cannot start/end with hyphen
- ❌ No consecutive hyphens
- ❌ Max 64 characters

**Get user approval before proceeding**.

## Step 2: Create Directory Structure

```bash
# Create skill directory
mkdir -p skills/[skill-name]
cd skills/[skill-name]

# Create optional directories (based on requirements)
mkdir -p scripts      # If skill needs executable code
mkdir -p references   # If skill has detailed docs
mkdir -p assets       # If skill has templates/data
```

**Confirm structure with user**.

## Step 3: Create SKILL.md

### Generate Frontmatter

**Minimal** (required fields only):
```yaml
---
name: skill-name
description: Brief description of what this skill does and when to use it. Include keywords like [keyword1], [keyword2] that help agents identify relevant tasks.
---
```

**Complete** (with optional fields):
```yaml
---
name: skill-name
description: Brief description of what this skill does and when to use it. Include keywords like [keyword1], [keyword2] that help agents identify relevant tasks.
license: Apache-2.0
compatibility: Requires git, docker, and internet access
metadata:
  author: org-name
  version: "1.0"
  tags: "category1, category2"
---
```

### Validation Rules

**Name field**:
- Must match directory name exactly
- 1-64 characters
- Lowercase alphanumeric + hyphens only
- Cannot start/end with hyphen
- No consecutive hyphens

**Description field**:
- 1-1024 characters
- Must describe WHAT and WHEN
- Include discoverable keywords
- Specific, not vague

### Generate Body Content

Create structured instructions:

```markdown
# [Skill Name]

[One paragraph overview of what this skill does]

## When to Use This Skill

Use this skill when:
- [Scenario 1]
- [Scenario 2]
- User mentions [keyword1], [keyword2], [keyword3]

## How It Works

### Step 1: [Action Name]
[Detailed instructions for first step]

**Example**:
\`\`\`
[Code or command example]
\`\`\`

### Step 2: [Action Name]
[Detailed instructions for second step]

[Continue with all steps...]

## Examples

### Example 1: [Common Use Case]

**Input**:
\`\`\`
[Example input]
\`\`\`

**Process**:
[What the agent does]

**Output**:
\`\`\`
[Expected result]
\`\`\`

## Common Issues

### Issue: [Problem Description]
**Solution**: [How to fix]

### Issue: [Another Problem]
**Solution**: [How to fix]

## Scripts

This skill includes executable scripts in [`scripts/`](scripts/):
- [`scripts/script1.py`](scripts/script1.py) - [Purpose]
- [`scripts/script2.sh`](scripts/script2.sh) - [Purpose]

See [scripts/README.md](scripts/README.md) for usage details.

## Additional Resources

For detailed technical information, see:
- [references/REFERENCE.md](references/REFERENCE.md) - Complete API reference
- [references/EXAMPLES.md](references/EXAMPLES.md) - Advanced examples
```

**Guidelines**:
- Keep SKILL.md under 500 lines
- Use clear headings
- Include examples
- Reference other files with relative paths
- One level deep for references

## Step 4: Create Optional Content

### If skill needs scripts:

**Create scripts/README.md**:
```markdown
# Scripts

Executable tools for [skill-name].

## [script-name.py]

**Purpose**: [What it does]

**Usage**: 
\`\`\`bash
python3 scripts/script-name.py [args]
\`\`\`

**Requirements**: [Dependencies]

**Examples**:
\`\`\`bash
python3 scripts/script-name.py --example
\`\`\`
```

**Create actual scripts**:
- Include error handling
- Add help messages
- Make executable: `chmod +x scripts/*.sh`
- Document dependencies clearly

### If skill needs references:

**Create references/REFERENCE.md**:
```markdown
# [Skill Name] Reference

Detailed technical documentation for [skill-name].

## Section 1
[Detailed content]

## Section 2
[Detailed content]
```

**Keep focused**:
- One reference file per major topic
- Under 1000 lines each
- Clear section headers
- Examples throughout

### If skill needs assets:

**Organize by type**:
```
assets/
├── templates/
│   └── config.template.json
├── data/
│   └── lookup-table.csv
└── images/
    └── diagram.png
```

## Step 5: Validate Skill

### Option A: Use skills-ref (Recommended)

```bash
# Install if needed
pip install skills-ref

# Validate skill
skills-ref validate .

# Expected output:
# ✅ SKILL.md frontmatter valid
# ✅ name field compliant
# ✅ description field present
# ✅ directory name matches
```

### Option B: Manual Validation

```bash
# Check name pattern
skill_name=$(grep "^name:" SKILL.md | awk '{print $2}')
echo "$skill_name" | grep -E '^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$' && echo "✅ Name valid" || echo "❌ Name invalid"

# Check name matches directory
dir_name=$(basename "$PWD")
[ "$skill_name" = "$dir_name" ] && echo "✅ Names match" || echo "❌ Names don't match"

# Check description length
desc_length=$(grep "^description:" SKILL.md | wc -c)
[ "$desc_length" -ge 1 ] && [ "$desc_length" -le 1024 ] && echo "✅ Description valid" || echo "❌ Description length invalid"

# Check SKILL.md at root
[ -f "SKILL.md" ] && echo "✅ SKILL.md at root" || echo "❌ SKILL.md not found"
```

### Validation Checklist

**Frontmatter**:
- [ ] name: present, 1-64 chars, lowercase/hyphens only
- [ ] description: present, 1-1024 chars, describes what+when
- [ ] name matches directory name
- [ ] YAML valid (no syntax errors)

**Structure**:
- [ ] SKILL.md at skill root
- [ ] Optional directories used correctly
- [ ] File references use relative paths
- [ ] References one level deep

**Content**:
- [ ] Clear step-by-step instructions
- [ ] Examples provided
- [ ] Common issues documented
- [ ] Scripts documented in SKILL.md
- [ ] SKILL.md under 500 lines

## Step 6: Test Integration

### Create Test Scenario

```markdown
## Test Plan

**Scenario**: [Describe task that should activate skill]

**Expected**:
1. Agent identifies skill as relevant
2. Agent loads SKILL.md
3. Agent follows instructions
4. Agent produces expected output

**Actual**:
[Test results]
```

### Integration Test

1. **Activation test**: Describe a task using keywords from description
2. **Instruction test**: Can agent follow the steps?
3. **Script test**: Do scripts execute properly?
4. **Reference test**: Can agent load additional docs when needed?

## Step 7: Document and Commit

### Update Parent README (if needed)

If skill is part of larger collection:

```markdown
## Skills

- **[skill-name](skills/skill-name/)** - [One-line description]
```

### Git Workflow

```bash
# Review changes
git status
git diff

# Add skill
git add skills/[skill-name]/

# Commit
git commit -m "feat: add [skill-name] skill

- Implements Agent Skills spec
- Includes [scripts/references/assets]
- Validated with skills-ref
"

# Push
git push origin main
```

## Common Issues

### Issue: Name validation fails

**Causes**:
- Uppercase letters
- Underscores instead of hyphens
- Starts/ends with hyphen
- Consecutive hyphens

**Fix**: Rename skill directory and update `name` field

### Issue: Description too vague

**Bad**: "Helps with files"
**Good**: "Processes CSV files by parsing, filtering, and transforming data. Use when user mentions CSV, spreadsheet parsing, or tabular data processing."

**Fix**: Add specifics about what, when, and keywords

### Issue: SKILL.md too long

**Fix**:
1. Move detailed content to `references/REFERENCE.md`
2. Keep SKILL.md to high-level steps
3. Reference detailed docs: `See [REFERENCE.md](references/REFERENCE.md)`

### Issue: Scripts not working

**Fix**:
1. Make executable: `chmod +x scripts/*.sh`
2. Add shebang: `#!/bin/bash` or `#!/usr/bin/env python3`
3. Document dependencies clearly
4. Add error handling and help messages

## Success Criteria

Skill is complete when:

- [ ] `skills-ref validate` passes (or manual validation complete)
- [ ] SKILL.md under 500 lines
- [ ] Scripts are executable and documented
- [ ] Test scenario passes
- [ ] Committed to version control
- [ ] User approves final result

## Pro Tips

1. **Start minimal** - Add optional directories only when needed
2. **Test early** - Validate after creating frontmatter
3. **Keep focused** - One skill, one capability
4. **Use examples** - Show, don't just tell
5. **Progressive disclosure** - Summary in SKILL.md, details in references/
6. **Document scripts** - Clear usage, dependencies, error messages

---

**References**:
- Agent Skills Spec: https://agentskills.io/specification
- skills-ref Library: https://github.com/agentskills/agentskills/tree/main/skills-ref
