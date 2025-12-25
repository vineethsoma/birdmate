---
description: Comprehensive Playwright automation testing skill with E2E testing standards,
  test generation workflows, and browser automation best practices. Use when writing
  automated browser tests, testing user flows, or performing web application QA.
metadata:
  apm_commit: unknown
  apm_installed_at: '2025-12-24T23:00:23.841361'
  apm_package: vineethsoma/agent-packages/skills/playwright-testing
  apm_version: 1.0.0
name: playwright-testing
type: skill
version: 1.0.0
---

# Playwright Testing Skill

Professional end-to-end testing with Playwright automation.

## What This Skill Provides

- **Testing Standards**: Best practices for Playwright test structure, selectors, and assertions
- **E2E Test Generation**: Automated workflow for creating comprehensive test suites
- **User Flow Testing**: Tools for testing complete user journeys
- **Specialist Agent**: Playwright expert configured with Microsoft's official MCP server

## When to Use This Skill

✅ Writing automated browser tests
✅ Testing user interactions and flows
✅ Cross-browser compatibility testing
✅ Visual regression testing
✅ Accessibility testing with Playwright
✅ API + UI integration testing
✅ Mobile viewport testing

❌ Unit testing (use tdd-workflow instead)
❌ Backend-only testing
❌ Performance load testing

## Primitives Included

### Instructions
- `playwright-standards.instructions.md` - Testing best practices and patterns

### Prompts
- `write-e2e-test.prompt.md` - Generate Playwright tests from requirements
- `test-user-flow.prompt.md` - Test complete user journeys

### Related Agent
- See `agents/playwright-specialist` for a dedicated E2E testing expert agent

## Integration with Other Skills

- **TDD Workflow**: Write Playwright tests using TDD discipline
- **Claude Framework**: Apply code quality standards to test code
- **Fullstack Expertise**: Test both frontend and backend together

## Example Usage

```bash
# Install the skill
apm install vineethsoma/agent-packages/skills/playwright-testing

# Use prompts directly
/write-e2e-test
/test-user-flow

# Or install the specialist agent
apm install vineethsoma/agent-packages/agents/playwright-specialist
@playwright-specialist Write E2E tests for user login flow
```

## MCP Server Required

This skill requires the **Microsoft Playwright MCP server**:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/test"]
    }
  }
}
```

Alternatively, use one of these MCP servers:
- `microsoft/playwright-mcp` (official, recommended)
- `executeautomation/mcp-playwright`
- `browserbase/mcp-server-browserbase`