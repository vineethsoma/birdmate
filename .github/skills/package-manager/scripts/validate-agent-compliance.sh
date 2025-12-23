#!/bin/bash
# validate-agent-compliance.sh
# Validates custom agent files against VS Code specification
# Usage: ./validate-agent-compliance.sh [path/to/.github/agents]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default path
AGENTS_DIR="${1:-.github/agents}"

echo -e "${BLUE}=== VS Code Custom Agent Compliance Validator ===${NC}"
echo ""

# Check if directory exists
if [ ! -d "$AGENTS_DIR" ]; then
    echo -e "${RED}❌ Error: Directory not found: $AGENTS_DIR${NC}"
    echo ""
    echo "Usage: $0 [path/to/agents/directory]"
    echo ""
    echo "Examples:"
    echo "  $0 .github/agents"
    echo "  $0 /path/to/workspace/.github/agents" 2>/dev/null)

if [ -z "$AGENT_FILES" ]; then
    echo -e "${YELLOW}⚠️  No .agent.md files found in $AGENTS_DIR${NC}"
    echo ""
    echo "This is normal if:"
    echo "  - You haven't created custom agents yet"
    echo "  - Agents are in a different directory"
    echo ""
    echo "To create custom agents:"
    echo "  1. Create .github/agents/ directory"
    echo "  2. Add .agent.md files following VS Code spec"
    echo "  3. Run this script again to validate"
    exit 0
fi

TOTAL_FILES=$(echo "$AGENT_FILES" | wc -l | tr -d ' ')
# Find all agent files
AGENT_FILES=$(find "$AGENTS_DIR" -name "*.agent.md" -type f)
TOTAL_FILES=$(echo "$AGENT_FILES" | wc -l | tr -d ' ')

if [ "$TOTAL_FILES" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No .agent.md files found in $AGENTS_DIR${NC}"
    exit 0
fi

echo -e "${BLUE}Found $TOTAL_FILES agent file(s)${NC}"
echo ""

# Unsupported attributes to check
UNSUPPORTED_ATTRS=("expertise" "boundaries" "author" "version" "color" "skills" "apm")

# Counters
COMPLIANT_COUNT=0
NON_COMPLIANT_COUNT=0
TOTAL_ISSUES=0

# Temporary file for detailed report
REPORT_FILE=$(mktemp)

echo "# Agent Compliance Report" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Generated**: $(date)" >> "$REPORT_FILE"
echo "**Directory**: $AGENTS_DIR" >> "$REPORT_FILE"
echo "**Total Files**: $TOTAL_FILES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check each file
for file in $AGENT_FILES; do
    FILE_ISSUES=0
    FILE_BASENAME=$(basename "$file")
    
    echo -e "${BLUE}Checking: $file${NC}"
    
    # Check for unsupported attributes
    for attr in "${UNSUPPORTED_ATTRS[@]}"; do
        if grep -q "^${attr}:" "$file"; then
            if [ $FILE_ISSUES -eq 0 ]; then
                echo "" >> "$REPORT_FILE"
                echo "## ❌ $file" >> "$REPORT_FILE"
                echo "" >> "$REPORT_FILE"
            fi
            echo -e "  ${RED}❌ Found unsupported attribute: $attr${NC}"
            echo "- Unsupported attribute: \`$attr\`" >> "$REPORT_FILE"
            LINE_NUM=$(grep -n "^${attr}:" "$file" | cut -d: -f1)
            echo "  - Line $LINE_NUM" >> "$REPORT_FILE"
            FILE_ISSUES=$((FILE_ISSUES + 1))
            TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
        fi
    done
    
    # Check for model aliases
    if grep -q "^model: sonnet" "$file" || grep -q "^model: gpt4" "$file"; then
        if [ $FILE_ISSUES -eq 0 ]; then
            echo "" >> "$REPORT_FILE"
            echo "## ⚠️  $file" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        fi
        MODEL_VALUE=$(grep "^model:" "$file" | awk '{print $2}')
        echo -e "  ${YELLOW}⚠️  Model alias detected: $MODEL_VALUE${NC}"
        echo "- Model alias: \`$MODEL_VALUE\` (use full name like 'Claude Sonnet 4')" >> "$REPORT_FILE"
        FILE_ISSUES=$((FILE_ISSUES + 1))
        TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
    fi
    
    # Check YAML frontmatter structure
    if ! grep -q "^---$" "$file"; then
        if [ $FILE_ISSUES -eq 0 ]; then
            echo "" >> "$REPORT_FILE"
            echo "## ❌ $file" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        fi
        echo -e "  ${RED}❌ Missing YAML frontmatter delimiters${NC}"
        echo "- Missing YAML frontmatter (---)" >> "$REPORT_FILE"
        FILE_ISSUES=$((FILE_ISSUES + 1))
        TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
    fi
    
    if [ $FILE_ISSUES -eq 0 ]; then
        echo -e "  ${GREEN}✅ Compliant${NC}"
        COMPLIANT_COUNT=$((COMPLIANT_COUNT + 1))
    else
        echo -e "  ${RED}Issues found: $FILE_ISSUES${NC}"
        NON_COMPLIANT_COUNT=$((NON_COMPLIANT_COUNT + 1))
    fi
    echo ""
done

# Summary
echo "---"
echo -e "${BLUE}=== Summary ===${NC}"
echo -e "Total files checked: $TOTAL_FILES"
echo -e "${GREEN}✅ Compliant: $COMPLIANT_COUNT${NC}"
echo -e "${RED}❌ Non-compliant: $NON_COMPLIANT_COUNT${NC}"
echo -e "${YELLOW}Total issues: $TOTAL_ISSUES${NC}"

# Write summary to report
echo "" >> "$REPORT_FILE"
echo "## Summary" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- **Total Files**: $TOTAL_FILES" >> "$REPORT_FILE"
echo "- **Compliant**: $COMPLIANT_COUNT ✅" >> "$REPORT_FILE"
echo "- **Non-Compliant**: $NON_COMPLIANT_COUNT ❌" >> "$REPORT_FILE"
echo "- **Total Issues**: $TOTAL_ISSUES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ $NON_COMPLIANT_COUNT -gt 0 ]; then
    echo "" >> "$REPORT_FILE"
    echo "## Remediation Steps" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "1. For each non-compliant file, remove unsupported attributes from YAML frontmatter" >> "$REPORT_FILE"
    echo "2. Move attribute content to markdown body (see migration guide)" >> "$REPORT_FILE"
    echo "3. Fix model aliases to use full names" >> "$REPORT_FILE"
    echo "4. Re-run validation: \`./validate-agent-compliance.sh\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Reference**: https://code.visualstudio.com/docs/copilot/customization/custom-agents" >> "$REPORT_FILE"
fi

# Save detailed report
REPORT_OUTPUT="agent-compliance-report.md"
cp "$REPORT_FILE" "$REPORT_OUTPUT"
echo ""
echo -e "${BLUE}📄 Detailed report saved: $REPORT_OUTPUT${NC}"

# Cleanup
rm "$REPORT_FILE"

# Exit with error if non-compliant files found
if [ $NON_COMPLIANT_COUNT -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Run the fix-agent-compliance prompt to migrate non-compliant agents.${NC}"
    exit 1
fi

exit 0
