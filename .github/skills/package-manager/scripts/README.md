# Package Manager Validation Scripts

Scripts for validating custom agents and APM package structure.

## Scripts

### 1. validate-agent-compliance.sh

Validates custom agent files against VS Code specification.

**Usage**:
```bash
./scripts/validate-agent-compliance.sh [path/to/.github/agents]
```

**What it checks**:
- ✅ Unsupported YAML attributes (expertise, boundaries, author, version, color, skills, apm)
- ✅ Model aliases (sonnet, gpt4)
- ✅ YAML frontmatter structure
- ✅ Generates detailed compliance report

**Output**:
- Console summary with color-coded results
- `agent-compliance-report.md` with detailed findings

**Example**:
```bash
# Check workspace agents
./scripts/validate-agent-compliance.sh .github/agents

# Check specific directory
./scripts/validate-agent-compliance.sh birdmate/.github/agents
```

### 2. validate-package-structure.sh

Validates APM package directory structure.

**Usage**:
```bash
./scripts/validate-package-structure.sh [package-path]
```

**What it checks**:
- ✅ SKILL.md at root
- ✅ apm.yml at root
- ✅ .apm/ directory exists
- ✅ .apm/ subdirectories present
- ✅ Content in .apm/ subdirectories (critical!)
- ✅ Primitive file conventions (frontmatter)
- ✅ Agent files for VS Code compliance

**Example**:
```bash
# Validate current package
./scripts/validate-package-structure.sh .

# Validate specific package
./scripts/validate-package-structure.sh ../my-skill
```

### 3. scan-workspace-agents.py

Python script for comprehensive workspace scanning.

**Usage**:
```bash
python3 scripts/scan-workspace-agents.py [workspace-path]
```

**What it does**:
- 🔍 Recursively finds all `.agent.md` files in workspace
- 📋 Analyzes YAML frontmatter for compliance
- 📊 Generates detailed markdown report
- 🎯 Identifies specific issues with line numbers

**Output**:
- Console summary
- `agent-compliance-report.md` with:
  - Non-compliant agents (with issues)
  - Compliant agents with warnings
  - Fully compliant agents
  - Remediation steps

**Example**:
```bash
# Scan current workspace
python3 scripts/scan-workspace-agents.py .

# Scan specific workspace
python3 scripts/scan-workspace-agents.py ~/projects/my-workspace
```

### 4. validate-agent-skill.py

Python script for Agent Skills validation.

**Usage**:
```bash
python3 scripts/validate-agent-skill.py [skill-directory]
```


### create-agent-skill.prompt.md
**Skill Creation** → Use workflow to create Agent Skills
**Validation** → Use `validate-agent-skill.py` to verify compliance
**What it does**:
- ✅ Validates SKILL.md frontmatter structure
- ✅ Checks name field compliance (lowercase, hyphens, 1-64 chars)
- ✅ Verifies name matches directory
- ✅ Validates description (1-1024 chars, not vague)
- ✅ Checks optional fields (compatibility, metadata)
- ✅ Validates directory structure (scripts/, references/, assets/)
- ✅ Warns about deep nesting or empty directories
- ✅ Generates detailed validation report

**Requirements**:
- Python 3.6+
- PyYAML: `pip install pyyaml`


# 4. Validate Agent Skill (if creating skills)
python3 scripts/validate-agent-skill.py ./skills/my-skill
**Output**:
- Console summary
- `skill-validation-report.md` with detailed findings

**Example**:
```bash
# Validate skill
python3 scripts/validate-agent-skill.py ./skills/my-skill

# Validate current directory (if it's a skill)
python3 scripts/validate-agent-skill.py .
```

## Integration with Prompts

These scripts are designed to work with package-manager prompts:

### fix-agent-compliance.prompt.md
**Step 1: Scan** → Use `scan-workspace-agents.py` or `validate-agent-compliance.sh`

### validate-package.prompt.md
**Structure Check** → Use `validate-package-structure.sh`

## Quick Start

**Make scripts executable**:
```bash
chmod +x scripts/*.sh
```

**Run full validation**:
```bash
# 1. Check agent compliance
./scripts/validate-agent-compliance.sh .github/agents

# 2. Check package structure
./scripts/validate-package-structure.sh .

# 3. Scan entire workspace (Python)
python3 scripts/scan-workspace-agents.py .
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/validate.yml
name: Validate Agents

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate agent compliance
        run: ./scripts/validate-agent-compliance.sh .github/agents
      
      - name: Validate package structure
        run: ./scripts/validate-package-structure.sh .
      
      - name: Upload compliance report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: compliance-report
          path: agent-compliance-report.md
```

## Exit Codes

All scripts follow standard exit code conventions:

- `0` - All validations passed
- `1` - Validation failures found

This makes them suitable for CI/CD pipelines and automation.

## Requirements

**Shell scripts** (validate-*.sh):

**Python script** (validate-agent-skill.py):
- Python 3.6+
- PyYAML: `pip install pyyaml`
- Bash 4.0+
- Standard Unix tools (grep, find, awk)
- Optional: `yq` for YAML validation

**Python script** (scan-workspace-agents.py):
- Python 3.6+
- No external dependencies (uses stdlib only)

## Troubleshooting

**Script not executable**:
```bash
chmod +x scripts/*.sh
```

**Python not found**:
```bash
# Use python3 explicitly
python3 scripts/scan-workspace-agents.py .
```

**Permission denied**:
```bash
# Run from package root
cd /path/to/package
./scripts/validate-agent-compliance.sh
```

## Development
gent Skills Spec](https://agentskills.io/specification)
- [APM Package Structure](../../docs/package-structure.md)
- [Agent Lifecycle Instructions](../.apm/instructions/agent-lifecycle.instructions.md)
- [Agent Skills Instructions](../.apm/instructions/agent-skills-spec

1. **Shell scripts**: Add check in main loop with counter
2. **Python script**: Add to `check_agent_compliance()` function
3. Update report generation for new issue types
4. Document in this README

## References

- [VS Code Custom Agents Spec](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [APM Package Structure](../../docs/package-structure.md)
- [Agent Lifecycle Instructions](../.apm/instructions/agent-lifecycle.instructions.md)
