---
applyTo: "**/SKILL.md"
description: "Agent Skills specification compliance for SKILL.md files"
---

# Agent Skills Specification Compliance

Follow the official Agent Skills format specification when creating or modifying SKILL.md files.

**Official Spec**: https://agentskills.io/specification

## SKILL.md Structure

Every skill must have a `SKILL.md` file at the root with:
1. **YAML frontmatter** (required)
2. **Markdown body** (instructions)

## YAML Frontmatter Requirements

### Required Fields

```yaml
---
name: skill-name
description: A description of what this skill does and when to use it.
---
```

**name field rules**:
- Must be 1-64 characters
- Lowercase alphanumeric and hyphens only (`a-z`, `0-9`, `-`)
- Cannot start or end with hyphen
- No consecutive hyphens (`--`)
- Must match parent directory name

**description field rules**:
- Must be 1-1024 characters
- Should describe BOTH:
  - What the skill does
  - When to use it
- Include specific keywords for discoverability

### Optional Fields

```yaml
---
name: skill-name
description: Complete description with use cases
license: Apache-2.0
compatibility: Requires git, docker, and internet access
metadata:
  author: example-org
  version: "1.0"
allowed-tools: Bash(git:*) Bash(jq:*) Read
---
```

**license** (optional):
- Short license name or reference to bundled LICENSE file
- Example: "Apache-2.0" or "Proprietary. See LICENSE.txt"

**compatibility** (optional, 1-500 characters):
- Only include if skill has specific environment requirements
- Indicate intended product, system packages, network access
- Example: "Designed for Claude Code (or similar products)"
- Example: "Requires git, docker, jq, and access to the internet"

**metadata** (optional):
- Map of string keys to string values
- Store additional properties not in spec
- Use unique key names to avoid conflicts
- Example: author, version, tags, url

**allowed-tools** (optional, experimental):
- Space-delimited list of pre-approved tools
- Example: "Bash(git:*) Bash(jq:*) Read"

## Markdown Body Guidelines

The body contains skill instructions. No format restrictions.

**Recommended sections**:
- Step-by-step instructions
- Examples of inputs and outputs
- Common edge cases and error handling
- When to use this skill
- When NOT to use this skill

**Progressive disclosure**:
- Keep main SKILL.md under 500 lines
- Move detailed reference to `references/` directory
- Keep instructions focused and scannable

## Optional Directory Structure

### scripts/
Contains executable code agents can run.

**Best practices**:
- Self-contained or clearly document dependencies
- Include helpful error messages
- Handle edge cases gracefully
- Support common languages: Python, Bash, JavaScript

**Reference scripts in SKILL.md**:
```markdown
Run the validation script:
[scripts/validate.py](scripts/validate.py)
```

### references/
Contains additional documentation loaded on demand.

**Recommended files**:
- `REFERENCE.md` - Detailed technical reference
- `FORMS.md` - Form templates or structured data
- Domain-specific files: `finance.md`, `legal.md`

**Keep files focused** - Agents load on demand, smaller is better.

**Reference in SKILL.md**:
```markdown
See [the reference guide](references/REFERENCE.md) for details.
```

### assets/
Contains static resources.

**Common assets**:
- Templates (document templates, configuration)
- Images (diagrams, examples)
- Data files (lookup tables, schemas)

## Progressive Disclosure Pattern

Structure skills for efficient context use:

1. **Metadata** (~100 tokens): name + description loaded at startup for ALL skills
2. **Instructions** (< 5000 tokens): SKILL.md body loaded when skill activated
3. **Resources** (as needed): scripts/, references/, assets/ loaded only when required

**Optimization**:
- Keep SKILL.md under 500 lines
- Move detailed docs to `references/`
- Keep file references one level deep

## File References

Use relative paths from skill root:

```markdown
See [reference guide](references/REFERENCE.md) for details.

Run extraction:
[scripts/extract.py](scripts/extract.py)

Use template:
[assets/template.json](assets/template.json)
```

**Avoid deep nesting** - Keep references one level deep from SKILL.md.

## Validation

### Using skills-ref Library

```bash
# Install
pip install skills-ref

# Validate skill
skills-ref validate ./my-skill

# Checks:
# - SKILL.md frontmatter validity
# - name field compliance
# - description length
# - naming conventions
```

### Manual Validation Checklist

**Frontmatter**:
- [ ] `name` field present (1-64 chars, lowercase, hyphens only)
- [ ] `description` field present (1-1024 chars, describes what + when)
- [ ] name matches directory name
- [ ] No unsupported fields in frontmatter

**Structure**:
- [ ] SKILL.md at root (not in subdirectory)
- [ ] Optional directories used correctly (scripts/, references/, assets/)
- [ ] File references use relative paths
- [ ] No deeply nested reference chains

**Content Quality**:
- [ ] Description includes specific keywords
- [ ] Instructions are clear and actionable
- [ ] SKILL.md under 500 lines (move extras to references/)
- [ ] Scripts have error handling
- [ ] Examples provided where helpful

## Common Pitfalls

### ❌ Name Field Errors

```yaml
# WRONG - uppercase
name: PDF-Processing

# WRONG - starts with hyphen
name: -pdf-tools

# WRONG - consecutive hyphens
name: pdf--processor

# WRONG - underscores
name: pdf_processing

# WRONG - doesn't match directory
# Directory: pdf-tools/
name: pdf-processor

# ✅ CORRECT
name: pdf-processing
```

### ❌ Description Too Vague

```yaml
# WRONG - no context
description: Helps with PDFs

# ✅ CORRECT - describes what and when
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF documents or when user mentions PDFs, forms, or document extraction.
```

### ❌ SKILL.md in Wrong Location

```
# WRONG
skill-name/
└── .apm/
    └── skills/
        └── SKILL.md  ❌

# ✅ CORRECT
skill-name/
└── SKILL.md  ✅
```

### ❌ Over-Complex Structure

```
# WRONG - deeply nested
references/
  detailed/
    specific/
      very-specific.md  ❌

# ✅ CORRECT - one level deep
references/
  detailed-reference.md  ✅
```

## Integration with APM

APM packages can contain skills. When creating skills within APM:

**Structure**:
```
skills/my-skill/
├── SKILL.md              # Agent Skills spec
├── apm.yml               # APM manifest
└── .apm/                 # APM primitives
    ├── instructions/
    ├── prompts/
    └── agents/
```

**Key difference**:
- **SKILL.md** = Agent Skills format (name, description in frontmatter)
- **apm.yml** = APM manifest (dependencies, version)
- Both can coexist in same package

## Template

```yaml
---
name: skill-name
description: Brief description of what this skill does and when to use it. Include specific keywords that help agents identify relevant tasks.
license: Apache-2.0
metadata:
  author: your-org
  version: "1.0"
---

# Skill Name

[Brief overview paragraph]

## When to Use This Skill

- Situation 1
- Situation 2
- When user mentions [keywords]

## How It Works

[Step-by-step instructions]

### Step 1: [Action]
[Details]

### Step 2: [Action]
[Details]

## Examples

### Example 1: [Scenario]
[Input]
[Process]
[Output]

## Common Issues

- Issue: [Description]
  - Solution: [Fix]

## Scripts

This skill includes helper scripts:
- [scripts/helper.py](scripts/helper.py) - [Purpose]

## Additional Resources

- [references/REFERENCE.md](references/REFERENCE.md) - Detailed reference
```

## Validation Commands

```bash
# Validate with skills-ref
skills-ref validate ./my-skill

# Check name compliance
echo "skill-name" | grep -E '^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$'

# Check directory name matches SKILL.md name
skill_name=$(grep "^name:" SKILL.md | awk '{print $2}')
dir_name=$(basename "$PWD")
[ "$skill_name" = "$dir_name" ] && echo "✅ Match" || echo "❌ Mismatch"
```

## References

- **Official Spec**: https://agentskills.io/specification
- **skills-ref Library**: https://github.com/agentskills/agentskills/tree/main/skills-ref
- **Example Skills**: https://github.com/agentskills/agentskills
