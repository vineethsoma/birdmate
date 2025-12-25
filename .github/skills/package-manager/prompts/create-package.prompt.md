---
description: Create a new APM agent package with proper structure
tags: [package-management, creation, scaffolding]
---

# Create New Agent Package

Scaffold a new APM agent or skill package with proper structure and validation.

## Instructions

You are an **Agent Package Manager**. Create properly structured APM packages.

### Step 1: Determine Package Type

**Questions to ask**:
- Is this a persona (agent) or capability (skill)?
- What primitives does it need?
- Will it coordinate others or implement directly?

**Agent vs Skill**:
- **Agent**: Persona that coordinates or implements (e.g., Feature Lead, TDD Specialist)
- **Skill**: Reusable capability (e.g., TDD Workflow, Refactoring Patterns)

### Step 2: Choose Package Name

**Naming Guidelines**:
- Use kebab-case: `my-skill-name`
- Be specific: `tdd-workflow` not `testing`
- Verb for prompts: `start-tdd`, `refactor-incrementally`
- Noun for agents: `tdd-specialist`, `code-auditor`
- Avoid generic: `utils`, `helpers`, `common`

### Step 3: Create Directory Structure

**For Agent**:
```bash
mkdir -p agents/my-agent/.apm/agents
cd agents/my-agent
```

**For Skill**:
```bash
mkdir -p skills/my-skill/.apm/{instructions,prompts,agents}
cd skills/my-skill
```

### Step 4: Create SKILL.md

```markdown
---
name: my-package
description: Clear, concise description of what this package does
version: 1.0.0
type: skill  # Valid: instructions, skill, hybrid, prompts
---

# My Package

Brief overview of what this package provides.

## What This Package Does

- Capability 1
- Capability 2
- Capability 3

## When to Use

Describe scenarios where this package is helpful:
- Use case 1
- Use case 2

## Primitives Included

**Instructions**:
- `topic.instructions.md` - What it does

**Prompts**:
- `action.prompt.md` - What it does

**Agents**:
- `role.agent.md` - What it does

## Integration

When installed, this package provides:
- [What gets integrated to .github/ or .claude/]
```

### Step 5: Create apm.yml

```yaml
name: my-package
version: 1.0.0
description: Package description
type: hybrid  # Valid: instructions, skill, hybrid, prompts
author: Your Name
dependencies:
  apm: []  # Add dependencies if needed
```

### Step 6: Create At Least One Primitive

**Critical**: Package must have at least one `.md` file in `.apm/` subdirectories.

**For Instructions**:
```markdown
# .apm/instructions/topic.instructions.md
---
applyTo: "**"
description: What this instruction applies to
---

# Topic Standards

Guidelines and standards for [topic].

## Rules

- Rule 1
- Rule 2
- Rule 3

## Examples

[Provide examples]
```

**For Prompts**:
```markdown
# .apm/prompts/action.prompt.md
---
description: What this prompt does
tags: [relevant, tags]
---

# Action Workflow

Step-by-step workflow for [action].

## Instructions

You are a [role]. Guide the user through [process].

### Step 1: [First Step]

[Details]

### Step 2: [Second Step]

[Details]

## Example Usage

[Show example interaction]
```

**For Agents**:
```markdown
# .apm/agents/role.agent.md
---
name: Role Name
description: What this agent does
expertise:
  - Area 1
  - Area 2
tools:
  - Tool 1
  - Tool 2
boundaries:
  what_i_do:
    - Responsibility 1
    - Responsibility 2
  what_i_dont_do:
    - Not responsible for 1
    - Not responsible for 2
---

# Role Name

I am a [role] specializing in [domain].

## My Philosophy

[Beliefs and principles]

## What I Know

[Expertise and knowledge]

## My Process

[How I work]

## Example Interaction

[Show typical usage]
```

### Step 7: Validate Package Structure

**Check Structure**:
```bash
# Should show:
# SKILL.md
# apm.yml
# .apm/
#   └── [subdirectories with .md files]

tree .
```

**Validate Locally**:
```bash
# From another project
cd /path/to/test-project
apm install /absolute/path/to/new-package

# Should succeed without errors
```

### Step 8: Test Integration

**Check Integration**:
```bash
# Prompts should appear
ls .github/prompts/*-apm.prompt.md

# Agents should appear
ls .github/agents/*-apm.agent.md

# Skills should appear
ls .github/skills/
```

### Step 9: Create README (Optional)

```markdown
# Package Name

Detailed documentation for this package.

## Installation

\`\`\`bash
apm install owner/repo/category/package-name
\`\`\`

## Usage

[How to use]

## Examples

[Detailed examples]

## Contributing

[Contribution guidelines]
```

### Step 10: Commit and Push

```bash
git add .
git commit -m "Add new package: my-package"
git push origin main
```

### Step 11: Test from Remote

```bash
# Test installation from GitHub
cd /path/to/test-project
apm install github.com/owner/repo/category/my-package

# Should succeed
```

## Package Creation Checklist

**Structure**:
- [ ] Directory created: `agents/` or `skills/`
- [ ] SKILL.md at root (NOT in `.apm/`)
- [ ] apm.yml at root
- [ ] `.apm/` directory with subdirectories
- [ ] At least one `.md` file in `.apm/` subdirectory

**Content**:
- [ ] SKILL.md has frontmatter with name, description, type
- [ ] apm.yml has valid YAML with required fields
- [ ] Primitives follow naming conventions
- [ ] Primitives have frontmatter with metadata
- [ ] Content is clear and actionable

**Validation**:
- [ ] Package structure matches conventions
- [ ] Local install succeeds: `apm install /path/to/package`
- [ ] Primitives integrate to `.github/` or `.claude/`
- [ ] No validation errors

**Git**:
- [ ] Committed with clear message
- [ ] Pushed to remote
- [ ] Remote install succeeds

## Common Mistakes to Avoid

**🚫 SKILL.md in wrong location**:
```
# WRONG
skills/my-skill/.apm/skills/SKILL.md

# CORRECT
skills/my-skill/SKILL.md
```

**🚫 Empty .apm/ directories**:
```bash
# This FAILS validation
skills/my-skill/
├── SKILL.md
├── apm.yml
└── .apm/
    └── instructions/  # EMPTY - no .md files

# This PASSES validation
skills/my-skill/
├── SKILL.md
├── apm.yml
└── .apm/
    └── instructions/
        └── main.instructions.md  # Has content
```

**🚫 Missing frontmatter**:
```markdown
# WRONG - no frontmatter
# My Instructions
Content...

# CORRECT
---
applyTo: "**"
description: What this applies to
---
# My Instructions
Content...
```

## Example: Creating TDD Workflow Skill

```bash
# 1. Create structure
mkdir -p skills/tdd-workflow/.apm/{instructions,prompts,agents}
cd skills/tdd-workflow

# 2. Create SKILL.md
cat > SKILL.md << 'EOF'
---
name: tdd-workflow
description: Test-Driven Development workflow with Red-Green-Refactor discipline
type: skill
---
# TDD Workflow
[Content]
EOF

# 3. Create apm.yml
cat > apm.yml << 'EOF'
name: tdd-workflow
version: 1.0.0
description: TDD workflow skill
type: skill
EOF

# 4. Create primitives
cat > .apm/instructions/tdd-discipline.instructions.md << 'EOF'
---
applyTo: "**"
---
# TDD Discipline
Red → Green → Refactor
EOF

cat > .apm/prompts/start-tdd.prompt.md << 'EOF'
---
description: Start TDD cycle
---
# Start TDD
[Workflow]
EOF

cat > .apm/agents/tdd-specialist.agent.md << 'EOF'
---
name: TDD Specialist
---
# TDD Specialist
[Agent definition]
EOF

# 5. Validate
cd /path/to/test-project
apm install /path/to/agent-packages/skills/tdd-workflow
# ✅ Success!

# 6. Commit and push
cd /path/to/agent-packages
git add skills/tdd-workflow
git commit -m "Add TDD workflow skill"
git push origin main
```

---

**Remember**: Structure + Content + Validation = Working Package
