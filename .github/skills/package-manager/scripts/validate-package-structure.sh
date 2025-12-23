#!/bin/bash
# validate-package-structure.sh
# Validates APM package structure
# Usage: ./validate-package-structure.sh [package-path]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PACKAGE_DIR="${1:-.}"

echo -e "${BLUE}=== APM Package Structure Validator ===${NC}"
echo ""
echo -e "Checking package: ${YELLOW}$PACKAGE_DIR${NC}"
echo ""

# Check if directory exists
if [ ! -d "$PACKAGE_DIR" ]; then
    echo -e "${RED}❌ Error: Directory not found: $PACKAGE_DIR${NC}"
    echo ""
    echo "Usage: $0 [package-path]"
    echo ""
    echo "Examples:"
    echo "  $0 .                    # Validate current directory"
    echo "  $0 ./agents/my-agent    # Validate specific package"
    echo "  $0 ../my-skill          # Validate relative path"
    exit 1
fi

# Change to package directory
cd "$PACKAGE_DIR" || {
    echo -e "${RED}❌ Error: Cannot access directory: $PACKAGE_DIR${NC}"
    echo "Check directory permissions."
    exit 1
}

ERRORS=0
WARNINGS=0

# Check 1: SKILL.md at root
echo -n "Checking for SKILL.md... "
if [ -f "SKILL.md" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Missing${NC}"
    echo -e "${RED}  → SKILL.md must exist at package root${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: apm.yml at root
echo -n "Checking for apm.yml... "
if [ -f "apm.yml" ]; then
    echo -e "${GREEN}✅${NC}"
    
    # Validate apm.yml structure
    if command -v yq &> /dev/null; then
        if yq eval '.name' apm.yml &> /dev/null; then
            echo -e "  ${GREEN}✓${NC} Valid YAML structure"
        else
            echo -e "  ${RED}✗${NC} Invalid YAML structure"
            ERRORS=$((ERRORS + 1))
        fi
    fi
else
    echo -e "${RED}❌ Missing${NC}"
    echo -e "${RED}  → apm.yml must exist at package root${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: .apm directory exists
echo -n "Checking for .apm/ directory... "
if [ -d ".apm" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Missing${NC}"
    echo -e "${RED}  → .apm/ directory must exist${NC}"
    ERRORS=$((ERRORS + 1))
    exit 1
fi

# Check 4: .apm subdirectories
echo "Checking .apm/ subdirectories..."
EXPECTED_DIRS=("instructions" "prompts" "agents" "contexts")
HAS_SUBDIRS=false

for dir in "${EXPECTED_DIRS[@]}"; do
    echo -n "  - $dir/... "
    if [ -d ".apm/$dir" ]; then
        echo -e "${GREEN}✅${NC}"
        HAS_SUBDIRS=true
    else
        echo -e "${YELLOW}⚠️  Not found${NC}"
    fi
done

if [ "$HAS_SUBDIRS" = false ]; then
    echo -e "${RED}  → .apm/ must contain at least one subdirectory${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: Content in .apm subdirectories (CRITICAL)
echo "Checking for content in .apm/ subdirectories..."
CONTENT_FOUND=false
EMPTY_DIRS=""

for echo ""
    echo "Common causes:"
    echo "  1. Package structure created but not populated"
    echo "  2. Missing primitive files (.instructions.md, .prompt.md, .agent.md)"
    echo "  3. Files in wrong location (should be in .apm/ subdirectories)"
    echo ""
    echo "To fix:"
    echo "  - Add instruction files to .apm/instructions/"
    echo "  - Add prompt files to .apm/prompts/"
    echo "  - Add agent files to .apm/agents/"
    dir in "${EXPECTED_DIRS[@]}"; do
    if [ -d ".apm/$dir" ]; then
        FILE_COUNT=$(find ".apm/$dir" -name "*.md" -type f | wc -l | tr -d ' ')
        echo -n "  - $dir/: "
        if [ "$FILE_COUNT" -gt 0 ]; then
            echo -e "${GREEN}$FILE_COUNT file(s) ✅${NC}"
            CONTENT_FOUND=true
        else
            echo -e "${RED}Empty ❌${NC}"
            EMPTY_DIRS="$EMPTY_DIRS .apm/$dir"
        fi
    fi
done

if [ "$CONTENT_FOUND" = false ]; then
    echo -e "${RED}CRITICAL: .apm/ directories are empty!${NC}"
    echo -e "${RED}  → At least one .apm/ subdirectory must contain .md files${NC}"
    ERRORS=$((ERRORS + 1))
elif [ -n "$EMPTY_DIRS" ]; then
    echo -e "${YELLOW}Warning: Empty subdirectories:$EMPTY_DIRS${NC}"
    echo -e "${YELLOW}  → Consider removing empty directories or adding content${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 6: Validate primitive files
echo "Validating primitive files..."

# Check instructions
if [ -d ".apm/instructions" ]; then
    for file in .apm/instructions/*.instructions.md; do
        if [ -f "$file" ]; then
            echo -n "  - $(basename "$file")... "
            if grep -q "^applyTo:" "$file"; then
                echo -e "${GREEN}✅${NC}"
            else
                echo -e "${YELLOW}⚠️  Missing 'applyTo' in frontmatter${NC}"
                WARNINGS=$((WARNINGS + 1))
            fi
        fi
    done
fi

# Check prompts
if [ -d ".apm/prompts" ]; then
    for file in .apm/prompts/*.prompt.md; do
        if [ -f "$file" ]; then
            echo -n "  - $(basename "$file")... "
            if grep -q "^description:" "$file"; then
                echo -e "${GREEN}✅${NC}"
            else
                echo -e "${YELLOW}⚠️  Missing 'description' in frontmatter${NC}"
                WARNINGS=$((WARNINGS + 1))
            fi
        fi
    done
fi

# Check agents (VS Code compliance)
if [ -d ".apm/agents" ]; then
    for file in .apm/agents/*.agent.md; do
        if [ -f "$file" ]; then
            echo -n "  - $(basename "$file")... "
            
            # Check for unsupported attributes
            AGENT_ISSUES=0
            for attr in "expertise" "boundaries" "author" "version" "color" "skills"; do
                if grep -q "^${attr}:" "$file"; then
                    AGENT_ISSUES=$((AGENT_ISSUES + 1))
                fi
            done
            
            if [ $AGENT_ISSUES -eq 0 ]; then
                echo -e "${GREEN}✅ Compliant${NC}"
            else
                echo -e "${RED}❌ $AGENT_ISSUES unsupported attribute(s)${NC}"
                ERRORS=$((ERRORS + 1))
            fi
        fi
    done
fi

# Check 7: README.md (recommended)
echo -n "Checking for README.md (recommended)... "
if [ -f "README.md" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️  Not found${NC}"
    echo -e "${YELLOW}  → README.md is recommended for package documentation${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "---"
echo -e "${BLUE}=== Validation Summary ===${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Package structure is valid!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Package structure is valid with warnings${NC}"
    echo -e "Warnings: $WARNINGS"
    exit 0
else
    echo -e "${RED}❌ Package structure is invalid${NC}"
    echo -e "Errors: $ERRORS"
    echo -e "Warnings: $WARNINGS"
    echo ""
    echo -e "${YELLOW}Fix errors and re-run validation.${NC}"
    exit 1
fi
