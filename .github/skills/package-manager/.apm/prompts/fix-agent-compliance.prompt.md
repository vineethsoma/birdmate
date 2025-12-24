---
description: Fix existing custom agents to comply with VS Code specification
tags: [agent-management, compliance, migration, validation]
tools: ['read', 'edit', 'search', 'execute']
---

# Fix Agent Compliance

Migrate existing `.agent.md` files to comply with VS Code custom agent specification.

## Overview

This workflow fixes non-compliant custom agents by:
1. Scanning for agents with unsupported attributes
2. Identifying specific compliance issues
3. Migrating attributes to markdown body
4. Validating fixes
5. Testing updated agents

**Reference**: https://code.visualstudio.com/docs/copilot/customization/custom-agents

## Step 1: Scan for Non-Compliant Agents

### Find All Agent Files

```bash
# Find all .agent.md files in workspace
find . -name "*.agent.md" -type f
```

### Check for Unsupported Attributes

```bash
# Search for unsupported YAML attributes
grep -rn "^expertise:" --include="*.agent.md" .
grep -rn "^boundaries:" --include="*.agent.md" .
grep -rn "^author:" --include="*.agent.md" .
grep -rn "^version:" --include="*.agent.md" .
grep -rn "^color:" --include="*.agent.md" .
grep -rn "^skills:" --include="*.agent.md" .
grep -rn "^apm:" --include="*.agent.md" .
```

**Supported attributes (ONLY these are valid)**:
- `name`
- `description`
- `argument-hint`
- `tools`
- `model`
- `infer`
- `target`
- `handoffs`

### Create Issue Report

Document findings:

```markdown
## Non-Compliance Report

**Total agents found**: X
**Non-compliant agents**: Y

### Issues by Type:
- `expertise` attribute: Z files
- `boundaries` attribute: A files
- `author` attribute: B files
- `version` attribute: C files
- `color` attribute: D files
- `skills` attribute: E files
- `apm` metadata: F files

### Affected Files:
1. path/to/agent1.agent.md
2. path/to/agent2.agent.md
...
```

## Step 2: Analyze Each Agent

For each non-compliant agent file:

### Read Current Structure

```bash
# Read file to understand structure
cat path/to/agent.agent.md | head -30
```

### Identify Issues

**Checklist**:
- [ ] Has `expertise` in YAML frontmatter?
- [ ] Has `boundaries` in YAML frontmatter?
- [ ] Has `author`, `version`, `color` in YAML?
- [ ] Has `skills` list in YAML?
- [ ] Has `apm` metadata in YAML?
- [ ] Uses model alias (e.g., "sonnet" instead of "Claude Sonnet 4.5")?
- [ ] Uses invalid tool names?
- [ ] Has handoffs with missing target agents?

### Plan Migration

For each unsupported attribute, determine target location in body:

| Attribute | Migration Strategy |
|-----------|-------------------|
| `expertise: [list]` | → Add "## Expertise Areas" section in body |
| `boundaries.what_i_do` | → Add "## What I Do" section in body |
| `boundaries.what_i_dont_do` | → Add "## What I Don't Do" section in body |
| `author: Name` | → Add to body or omit if not essential |
| `version: X.Y.Z` | → Add to body or omit (use git for versioning) |
| `color: value` | → Omit (not supported) |
| `skills: [list]` | → Add "## Skills" or "## Leverages" section in body |
| `apm: {...}` | → Remove (internal metadata only) |

## Step 3: Fix Agent Files

### Template for Migration

**Before** (non-compliant):
```yaml
---
name: My Agent
description: Does stuff
expertise:
  - area-1
  - area-2
boundaries:
  what_i_do:
    - task-1
  what_i_dont_do:
    - anti-task-1
author: John Doe
version: 1.0.0
color: blue
skills:
  - skill-1
tools: ['read', 'edit']
model: sonnet
---
```

**After** (compliant):
```yaml
---
name: My Agent
description: Does stuff with expertise in area-1 and area-2
tools: ['read', 'edit']
model: Claude Sonnet 4.5
---

# My Agent

## Expertise Areas
- Area 1
- Area 2

## What I Do
- ✅ Task 1

## What I Don't Do
- ❌ Anti-task 1

## Skills
This agent leverages:
- Skill 1

---
**Author**: John Doe  
**Version**: 1.0.0
```

### Migration Script (Manual Edits)

For each file:

1. **Extract unsupported attributes** from YAML
2. **Update description** (optionally incorporate expertise summary)
3. **Remove unsupported YAML attributes**
4. **Add sections to markdown body**:
   - Expertise Areas (if applicable)
   - What I Do / What I Don't Do
   - Skills/Leverages
   - Metadata footer (author/version if needed)
5. **Fix model names** (use full names, not aliases)
6. **Verify tool names** are valid

### Batch Processing Pattern

For workspace-wide fixes:

```bash
# Create backup first
cp -r .github/agents .github/agents.backup

# Process each file
for file in .github/agents/*.agent.md; do
  echo "Processing: $file"
  # Apply fixes (use multi_replace_string_in_file for efficiency)
done
```

## Step 4: Validate Fixes

### Check VS Code Diagnostics

Open each fixed file in VS Code and verify:
- [ ] No red squigglies in YAML frontmatter
- [ ] No "Attribute X is not supported" errors
- [ ] No "Unknown model" errors
- [ ] No "Unknown tool" errors

### Run Compliance Check

```bash
# Verify no unsupported attributes remain
grep -rn "^expertise:" --include="*.agent.md" .
grep -rn "^boundaries:" --include="*.agent.md" .
grep -rn "^author:" --include="*.agent.md" .
grep -rn "^version:" --include="*.agent.md" .
grep -rn "^color:" --include="*.agent.md" .
grep -rn "^skills:" --include="*.agent.md" .

# Expected: No matches found
```

### Verify Structure Integrity

For each fixed file:
```bash
# Check YAML frontmatter is valid
cat agent.agent.md | sed -n '/^---$/,/^---$/p'

# Verify only supported attributes present
# Should see: name, description, tools, model, handoffs, etc.
```

## Step 5: Test Updated Agents

### Functional Testing

For each updated agent:

1. **Open VS Code Chat**
2. **Select agent from dropdown**
   - Verify agent appears with correct name
   - Verify description shows as placeholder
3. **Test basic interaction**
   - Send test prompt
   - Verify agent responds appropriately
   - Check that specified tools are available
4. **Test handoffs** (if configured)
   - Complete agent workflow
   - Verify handoff buttons appear
   - Click handoff and verify context transfer

### Regression Testing

Ensure migrated content still works:

**Checklist**:
- [ ] Agent instructions still apply correctly
- [ ] Tool restrictions still enforced
- [ ] Handoffs transition properly
- [ ] Model selection works (if specified)
- [ ] Agent behavior unchanged (only format changed)

## Step 6: Document Changes

### Update Package Documentation

If agents are part of APM package:

1. **Update SKILL.md** if agent capabilities changed
2. **Update apm.yml version** (PATCH bump for fixes)
3. **Update README.md** with migration notes
4. **Create CHANGELOG entry**:

```markdown
## [1.0.1] - 2025-12-23

### Changed
- Migrated all custom agents to VS Code spec compliance
- Moved unsupported YAML attributes to markdown body
- Updated model names to use full official names

### Migration
All `.agent.md` files updated to remove:
- `expertise` attribute (now in body)
- `boundaries` attribute (now in "What I Do/Don't Do" sections)
- `author`, `version`, `color` attributes (moved to body or removed)
```

## Step 7: Commit Changes

```bash
# Review changes
git status
git diff .github/agents/

# Stage changes
git add .github/agents/

# Commit with clear message
git commit -m "fix: migrate custom agents to VS Code spec compliance

- Remove unsupported YAML attributes (expertise, boundaries, etc.)
- Move attribute content to markdown body
- Fix model names to use official names
- Verify all agents pass VS Code validation

Ref: https://code.visualstudio.com/docs/copilot/customization/custom-agents"

# Push changes
git push origin main
```

## Troubleshooting

### Common Issues

#### Issue: "Attribute X is not supported"

**Cause**: Unsupported attribute in YAML frontmatter

**Fix**: 
1. Remove attribute from YAML
2. Move content to markdown body
3. See migration template in Step 3

#### Issue: "Unknown model 'sonnet'"

**Cause**: Using model alias instead of full name

**Fix**: Replace with official model name:
- `sonnet` → `Claude Sonnet 4.5`
- `gpt4` → `GPT-4`
- `gpt-4-turbo` → `GPT-4 Turbo`

#### Issue: "Unknown tool 'X'"

**Cause**: Invalid tool name or tool not available

**Fix**:
1. Check tool is spelled correctly
2. Verify tool exists in VS Code
3. For MCP tools, use `servername/*` format
4. Remove tool if not available

#### Issue: Agent not appearing in dropdown

**Cause**: File not in correct location or hidden

**Fix**:
1. Verify file in `.github/agents/` directory
2. Check file has `.agent.md` extension
3. Open Configure Custom Agents → Verify agent not hidden

#### Issue: Handoff button doesn't appear

**Cause**: Target agent doesn't exist or handoff misconfigured

**Fix**:
1. Verify target agent exists
2. Check agent name matches target
3. Test by completing agent workflow (handoffs appear after response)

## Success Criteria

Migration is complete when:

- [ ] All `.agent.md` files use only supported YAML attributes
- [ ] No VS Code diagnostics errors in agent files
- [ ] All agents appear in dropdown correctly
- [ ] Agents function as expected in chat
- [ ] Handoffs work (if configured)
- [ ] Changes committed to version control
- [ ] Documentation updated
- [ ] Team notified of migration

## Post-Migration

### Share with Team

**Communication template**:

```markdown
## Custom Agent Migration Complete 🎉

We've updated all custom agents to comply with VS Code specification.

**What changed**:
- Agent file format updated (YAML attributes)
- Functionality unchanged (same behavior)
- Location unchanged (.github/agents/)

**Action required**:
- Pull latest changes: `git pull origin main`
- Reload VS Code window
- Verify agents appear in dropdown

**Questions?** Check updated docs or reach out!
```

### Establish Maintenance Process

**For new agents**:
- Use templates from `agent-lifecycle.instructions.md`
- Follow creation checklist
- Validate before committing

**For updates**:
- Only modify supported YAML attributes
- Keep unsupported content in body
- Test before committing

---

**Pro Tips**:
- Use multi_replace_string_in_file for batch efficiency
- Test one agent fully before processing all
- Keep backup until migration verified
- Document any unique migration decisions
