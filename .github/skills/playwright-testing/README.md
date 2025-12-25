# Playwright Testing Skill

Comprehensive Playwright automation testing skill for E2E test generation and browser automation.

## Package Structure

```
skills/playwright-testing/
├── SKILL.md                                          # Package overview
├── apm.yml                                           # Dependencies and metadata
└── .apm/
    ├── agents/
    │   └── playwright-specialist.agent.md            # E2E testing expert
    ├── instructions/
    │   └── playwright-standards.instructions.md      # Testing best practices
    └── prompts/
        ├── write-e2e-test.prompt.md                  # Generate Playwright tests
        └── test-user-flow.prompt.md                  # Test complete user journeys
```

## Features

### 📋 Instructions
- Playwright testing standards and patterns
- Selector hierarchy (user-facing > test IDs > CSS)
- Test independence and parallel execution
- API mocking best practices
- Accessibility testing guidelines

### 🔧 Prompts
- **write-e2e-test**: Generate comprehensive E2E tests from requirements
- **test-user-flow**: Create tests for complete user journeys

### 🤖 Related Agent
- **playwright-specialist**: Dedicated E2E testing expert agent
  - Install: `apm install vineethsoma/agent-packages/agents/playwright-specialist`
  - This skill is included as a dependency

## Installation

```bash
# Install the skill
apm install vineethsoma/agent-packages/skills/playwright-testing

# Install dependencies (will prompt if not already installed)
# - vineethsoma/agent-packages/skills/tdd-workflow
# - vineethsoma/agent-packages/skills/claude-framework
```

## MCP Server Configuration

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@microsoft/playwright-mcp"]
    }
  }
}
```

## Usage Examples

### Using Prompts

```
/write-e2e-test
/test-user-flow
```

### Using the Specialist Agent

First install the agent:
```bash
apm install vineethsoma/agent-packages/agents/playwright-specialist
```

Then invoke:
```
@playwright-specialist Write E2E tests for user login flow
```

The prompt will guide you through:
1. Understanding requirements
2. Mapping user flow
3. Writing test structure
4. Implementing tests with best practices
5. Adding edge cases and accessibility tests

## Testing Standards Applied

✅ **User-facing selectors**: `getByRole()`, `getByLabel()`, `getByText()`
✅ **Explicit waits**: Never arbitrary timeouts
✅ **Independent tests**: No shared state
✅ **Clear assertions**: What users see/experience
✅ **Accessibility-first**: Keyboard nav, ARIA, screen readers
✅ **Cross-browser**: Chromium, Firefox, WebKit
✅ **Mobile testing**: Responsive viewports

## Integration with Other Skills

- **TDD Workflow**: Follow TDD discipline when writing tests
- **Claude Framework**: Apply code quality standards
- **Fullstack Expertise**: Test entire application stack

## Version

1.0.0

## Author

Vineeth Soma

## License

MIT
