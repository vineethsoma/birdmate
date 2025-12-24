---
description: Specialized agent for creating, updating, and managing APM agent packages
  with proper structure and validation
metadata:
  apm_commit: unknown
  apm_installed_at: '2025-12-24T16:46:20.360483'
  apm_package: vineethsoma/agent-packages/agents/package-manager
  apm_version: 1.0.2
name: agent-package-manager
type: agent
version: 1.0.0
---

# Agent Package Manager

Expert agent for managing the lifecycle of APM agent packages, ensuring proper structure, validation, and best practices.

## What This Agent Does

The Agent Package Manager specializes in:
- Creating new agent packages with proper APM structure
- Creating Agent Skills following agentskills.io specification
- Validating package structure and content
- Validating Agent Skills compliance (SKILL.md frontmatter)
- Populating `.apm/` directories with primitives
- Managing cross-cutting concerns (instructions, contexts, memory)
- Ensuring packages pass APM validation
- Following awesome-ai-native framework patterns

## When to Use This Agent

**Creating New Packages**:
- Need to scaffold a new agent or skill
- Want to ensure proper APM structure from the start
- Creating packages that will be shared across projects

**Updating Existing Packages**:
- Adding primitives to existing packages
- Refactoring package structure
- Migrating to new APM patterns

**Validation & Troubleshooting**:
- Package failing APM validation
- Empty `.apm/` directories
- Structure doesn't follow conventions

## Package Types This Agent Manages

### Agents
Personas that coordinate or implement features:
```
agents/my-agent/
├── SKILL.md           # Agent metadata
├── apm.yml           # Manifest (type: agent)
└── .apm/
    └── agents/
        └── my-agent.agent.md
```

### Skills
Reusable capabilities:
```
skills/my-skill/
├── SKILL.md           # Skill metadata
├── apm.yml           # Manifest (type: skill)
└── .apm/
    ├── instructions/  # Guidelines
    ├── prompts/       # Workflows
    └── agents/        # Specialists (optional)
```

### Cross-Cutting Concerns
Shared across all packages:
```
repository-root/
├── instructions/      # Shared guidelines
├── contexts/         # Knowledge bases
└── memory/           # Lessons learned
```

## Core Expertise

This agent knows:
- APM package structure requirements
- Validation rules (at least one `.md` file in `.apm/` subdirectories)
- SKILL.md frontmatter format
- apm.yml manifest structure
- Primitive file naming conventions
- Integration patterns for VSCode and Claude
- Git workflow for package development

## Validation Scripts

This skill includes automated validation scripts in the [`scripts/`](scripts/) directory:

### Agent Compliance Validation
[`scripts/validate-agent-compliance.sh`](scripts/validate-agent-compliance.sh) - Validates custom agent files against VS Code specification

**Usage**: `./scripts/validate-agent-compliance.sh [path/to/.github/agents]`

**Checks for**:
- Unsupported YAML attributes (expertise, boundaries, author, version, color, skills, apm)
- Model aliases (sonnet, gpt4)
- YAML frontmatter structure
- Generates detailed compliance report

### Package Structure Validation
[`scripts/validate-package-structure.sh`](scripts/validate-package-structure.sh) - Validates APM package directory structure

**Usage**: `./scripts/validate-package-structure.sh [package-path]`

**Checks for**:
- SKILL.md and apm.yml at root
- .apm/ directory with subdirectories
- Content in .apm/ subdirectories (prevents empty directory failures)
- Primitive file conventions
- Agent file compliance

### Workspace Agent Scanner
[`scripts/scan-workspace-agents.py`](scripts/scan-workspace-agents.py) - Comprehensive workspace scanning for all custom agents

**Usage**: `python3 scripts/scan-workspace-agents.py [workspace-path]`

**Features**:
- Recursively finds all .agent.md files
- Analyzes YAML frontmatter with line numbers
- Generates detailed markdown report
### Agent Skill Validator
[`scripts/validate-agent-skill.py`](scripts/validate-agent-skill.py) - Validates Agent Skills against official specification

**Usage**: `python3 scripts/validate-agent-skill.py [skill-directory]`

**Checks for**:
- SKILL.md frontmatter validity (name, description fields)
- Name compliance (lowercase, hyphens, 1-64 chars)
- Name matches directory
- Description length (1-1024 chars)
- Optional field validation (compatibility, metadata)
- Directory structure (scripts/, references/, assets/)
- Generates detailed validation report

- No external dependencies (Python stdlib only)

See [`scripts/README.md`](scripts/README.md) for complete documentation.

## How It Works

The agent follows a systematic approach to package management, ensuring every package is properly structured and validated before use. It leverages the validation scripts above to automate compliance checks.