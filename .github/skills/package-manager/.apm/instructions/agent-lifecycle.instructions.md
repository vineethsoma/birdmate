---
applyTo: "**/*.agent.md"
description: "VS Code Custom Agent Specification and Lifecycle Management"
---

# Custom Agent Lifecycle Management

Follow the official VS Code custom agent specification when creating, validating, and managing `.agent.md` files.

**Official Spec**: https://code.visualstudio.com/docs/copilot/customization/custom-agents

## What Are Custom Agents?

Custom agents enable you to configure the AI to adopt different personas tailored to specific development roles and tasks. Each persona can have its own behavior, available tools, and instructions.

Custom agents consist of:
- **Instructions**: Guidelines defining how the AI should operate
- **Tools**: Specific capabilities available to the agent
- **Handoffs**: Guided workflows transitioning between agents

## Agent File Structure

### Required Elements

**File Extension**: `.agent.md`
**Default Location**: `.github/agents/` (auto-detected by VS Code)
**Alternative Locations**: 
- Workspace: `.github/agents/` (team-shared)
- User Profile: `~/.vscode/profiles/<profile>/agents/` (personal)

### YAML Frontmatter (Header)

**Supported Attributes** (ONLY these are valid):

```yaml
---
# Required
name: string                  # Agent name (defaults to filename)
description: string           # Brief description (chat placeholder text)

# Optional
argument-hint: string         # Hint text for chat input
tools: [string]              # List of tool/tool-set names
model: string                # AI model name (e.g., "Claude Sonnet 4.5", "GPT-4")
infer: boolean               # Enable as subagent (default: true)
target: string               # Environment: "vscode" or "github-copilot"
mcp-servers: [object]        # MCP server configs (github-copilot only)

# Handoffs (workflow transitions)
handoffs:
  - label: string            # Button text
    agent: string            # Target agent ID
    prompt: string           # Pre-filled prompt
    send: boolean            # Auto-submit (default: false)
---
```

### Markdown Body

Contains the agent implementation:
- Detailed instructions and guidelines
- Specific prompts and behaviors
- Reference to other files via Markdown links
- Tool references using `#tool:<tool-name>` syntax

## Tools Configuration

### Built-in Tools
- `search` - Search workspace
- `fetch` - Fetch web content
- `read` - Read files
- `edit` - Edit files
- `execute` - Run commands
- `usages` - Find code usages
- `githubRepo` - GitHub repository operations

### Tool Sets
- Use server name with wildcard for all MCP tools: `servername/*`
- Can mix built-in tools and MCP tools in same list

### Tool Priority Order
1. Tools specified in prompt file (if any)
2. Tools from referenced custom agent in prompt (if any)
3. Default tools for selected agent

## Handoffs (Guided Workflows)

Handoffs enable sequential workflows with suggested next steps.

**Use Cases**:
- Planning → Implementation
- Implementation → Review
- Write Failing Tests → Write Passing Tests

**Configuration**:
```yaml
handoffs:
  - label: Start Implementation
    agent: implementation
    prompt: Now implement the plan outlined above.
    send: false
```

**Behavior**:
- Handoff buttons appear after chat response completes
- Users click to switch agents with context preserved
- If `send: true`, prompt auto-submits
- If `send: false`, prompt pre-fills for review

## Lifecycle Management

### Creating New Agents

**Command**: `Chat: New Custom Agent` or Configure Custom Agents → Create new

**Process**:
1. Choose location (workspace or user profile)
2. Enter filename (becomes default name)
3. Fill YAML frontmatter with supported attributes ONLY
4. Add instructions in markdown body
5. Test agent in chat

**Validation Checklist**:
- [ ] YAML frontmatter uses only supported attributes
- [ ] Description is concise (one sentence)
- [ ] Tools list contains valid tool names
- [ ] Model name is full/official (not aliases)
- [ ] Handoffs reference existing agents
- [ ] Body contains clear instructions
- [ ] No unsupported attributes (expertise, boundaries, skills, author, version, color)

### Updating Agents

**Command**: Configure Custom Agents → Select agent to modify

**Safe Update Process**:
1. Open existing `.agent.md` file
2. Verify YAML attributes are supported
3. Move unsupported attributes to body
4. Update instructions in markdown
5. Test changes in chat
6. Commit to version control

### Organizing Agents

**Show/Hide in Dropdown**:
- Configure Custom Agents → Hover over agent → Click eye icon

**Sharing Across Teams**:
- Workspace agents: `.github/agents/` (team-shared)
- Organization agents: Enable via `github.copilot.chat.customAgents.showOrganizationAndEnterpriseAgents`
- User profile agents: Personal use across workspaces

## Migration from Legacy Formats

### Chat Modes → Custom Agents

**Old Format**: `.chatmode.md` in `.github/chatmodes/`
**New Format**: `.agent.md` in `.github/agents/`

**VS Code provides Quick Fix** to:
- Rename `.chatmode.md` → `.agent.md`
- Move from `.github/chatmodes/` → `.github/agents/`

**Manual Migration**:
1. Rename file extension
2. Move to new directory
3. Update YAML frontmatter (remove unsupported attributes)
4. Test functionality

### Unsupported Attributes Migration

**Move these from YAML to markdown body**:

```yaml
# ❌ OLD (in YAML frontmatter)
expertise:
  - domain-1
  - domain-2
boundaries:
  what_i_do:
    - task-1
  what_i_dont_do:
    - anti-task-1
author: Name
version: 1.0.0
color: blue
skills:
  - skill-1
```

```markdown
# ✅ NEW (in markdown body)

## Expertise Areas
- Domain 1
- Domain 2

## What I Do
- Task 1

## What I Don't Do
- Anti-task 1

**Author**: Name  
**Version**: 1.0.0
```

## Best Practices

### Agent Design Principles

1. **Single Responsibility**: Each agent should have one clear purpose
2. **Tool Specificity**: Only include tools needed for the agent's role
3. **Clear Boundaries**: Explicitly state what agent does and doesn't do
4. **Workflow Integration**: Use handoffs for multi-step processes
5. **Descriptive Names**: Use role-based names (Planner, Reviewer, Implementer)

### Tool Selection Guidelines

- **Planning agents**: Read-only tools (`search`, `fetch`, `usages`)
- **Implementation agents**: Full editing tools (`edit`, `execute`)
- **Review agents**: Analysis tools (`search`, `usages`, `fetch`)
- **Security agents**: Scanning and analysis tools only

### Handoff Patterns

**Sequential Workflows**:
```
Plan → Implement → Review → Deploy
```

**Iterative Workflows**:
```
Write Tests (fail) → Implement (pass) → Refactor
```

**Approval Gates**:
- Use `send: false` for human review between steps
- Use `send: true` for automated transitions (use sparingly)

## Common Pitfalls

### ❌ Avoid These Mistakes

1. **Using unsupported YAML attributes** → Causes validation errors
2. **Generic tool lists** → Include all tools defeats purpose of specialization
3. **Missing descriptions** → Users won't understand agent purpose
4. **Vague instructions** → AI won't know how to behave
5. **No handoffs** → Users manually switch agents (friction)
6. **Auto-send on every handoff** → Removes human control
7. **Model aliases** → Use "Claude Sonnet 4.5", not "sonnet"

### ✅ Success Patterns

1. **Focused tool sets** → Only tools needed for role
2. **Clear descriptions** → One-sentence purpose statement
3. **Explicit instructions** → Tell AI exactly how to operate
4. **Strategic handoffs** → Design complete workflows
5. **Manual approval gates** → `send: false` for critical transitions
6. **Testing before sharing** → Validate agent behavior in chat
7. **Version control** → Track agent evolution over time

## Template Library

### Planning Agent
```markdown
---
name: Planner
description: Generate implementation plans for features and refactoring
tools: ['search', 'fetch', 'usages', 'githubRepo']
model: Claude Sonnet 4.5
handoffs:
  - label: Implement Plan
    agent: implementation
    prompt: Implement the plan outlined above.
    send: false
---

# Planning Instructions

You are in planning mode. Generate implementation plans only.

## What You Do
- Research codebase with search and usages tools
- Generate detailed implementation plans
- Identify dependencies and risks
- Break down into actionable steps

## What You Don't Do
- Make code edits
- Execute commands
- Implement features

## Plan Structure
Include these sections:
- Overview
- Requirements
- Implementation Steps
- Testing Strategy
```

### Implementation Agent
```markdown
---
name: Implementation
description: Implement features following TDD and best practices
tools: ['read', 'edit', 'execute', 'search']
model: Claude Sonnet 4.5
handoffs:
  - label: Request Review
    agent: reviewer
    prompt: Review the implementation for quality and security.
    send: false
---

# Implementation Instructions

You implement features with production quality.

## What You Do
- Write tests first (TDD)
- Implement to pass tests
- Follow code standards
- Add documentation

## What You Don't Do
- Skip tests
- Make breaking changes without approval
- Ignore error handling
```

### Review Agent
```markdown
---
name: Reviewer
description: Review code for quality, security, and best practices
tools: ['read', 'search', 'usages']
model: Claude Sonnet 4.5
handoffs:
  - label: Fix Issues
    agent: implementation
    prompt: Address the review feedback above.
    send: false
---

# Review Instructions

You review code for production readiness.

## Review Checklist
- [ ] Code quality and maintainability
- [ ] Security vulnerabilities
- [ ] Test coverage
- [ ] Documentation
- [ ] Performance considerations

## What You Do
- Identify issues with specific line numbers
- Suggest improvements with examples
- Assess production readiness
- Flag blocking issues

## What You Don't Do
- Implement fixes (delegate to implementation agent)
- Approve without thorough review
```

## Validation Commands

When creating or updating agents, validate with these checks:

```bash
# Check for unsupported attributes
grep -E "^(expertise|boundaries|author|version|color|skills):" .github/agents/*.agent.md

# Verify file structure
ls -la .github/agents/

# Test in VS Code
# 1. Open Command Palette (Cmd+Shift+P)
# 2. Run: Chat: New Custom Agent
# 3. Test agent in chat view
```

## References

- **Official Docs**: https://code.visualstudio.com/docs/copilot/customization/custom-agents
- **Tool Documentation**: https://code.visualstudio.com/docs/copilot/chat/chat-tools
- **Prompt Files**: https://code.visualstudio.com/docs/copilot/customization/prompt-files
- **Custom Instructions**: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
