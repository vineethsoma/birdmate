#!/usr/bin/env python3
"""
scan-workspace-agents.py
Scans workspace for all custom agents and generates compliance report
"""

import os
import sys
import re
from pathlib import Path
from typing import List, Dict, Tuple
from datetime import datetime

# ANSI color codes
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    RESET = '\033[0m'

# Supported VS Code agent attributes
SUPPORTED_ATTRS = {
    'name', 'description', 'argument-hint', 'tools', 
    'model', 'infer', 'target', 'handoffs', 'mcp-servers'
}

# Unsupported attributes to flag
UNSUPPORTED_ATTRS = {
    'expertise', 'boundaries', 'author', 'version', 
    'color', 'skills', 'apm'
}

def find_agent_files(workspace_path: str) -> List[Path]:
    """Find all .agent.md files in workspace"""
    workspace = Path(workspace_path)
    
    if not workspace.exists():
        print(f"{Colors.RED}❌ Error: Workspace directory not found: {workspace_path}{Colors.RESET}")
        print()
        print("Usage: python3 scan-workspace-agents.py [workspace-path]")
        print()
        print("Examples:")
        print("  python3 scan-workspace-agents.py .")
        print("  python3 scan-workspace-agents.py ~/projects/my-workspace")
        sys.exit(1)
    
    if not workspace.is_dir():
        print(f"{Colors.RED}❌ Error: Path is not a directory: {workspace_path}{Colors.RESET}")
        sys.exit(1)
    
    agent_files = []
    
    # Search common locations
    search_paths = [
        workspace / '.github' / 'agents',
        workspace / '.github' / 'skills',
        workspace / 'agents',
        workspace / 'skills',
    ]
    
    try:
        for search_path in search_paths:
            if search_path.exists():
                for agent_file in search_path.rglob('*.agent.md'):
                    agent_files.append(agent_file)
    except PermissionError as e:
        print(f"{Colors.YELLOW}⚠️  Warning: Permission denied accessing some directories{Colors.RESET}")
        print(f"Continuing with accessible files...")
    
    return sorted(set(agent_files))

def extract_yaml_frontmatter(content: str) -> Tuple[Dict, int, int]:
    """Extract YAML frontmatter and line numbers"""
    lines = content.split('\n')
    yaml_lines = {}
    start_line = -1
    end_line = -1
    in_yaml = False
    delimiter_count = 0
    
    for i, line in enumerate(lines, 1):
        if line.strip() == '---':
            delimiter_count += 1
            if delimiter_count == 1:
                start_line = i
                in_yaml = True
            elif delimiter_count == 2:
                end_line = i
                break
        elif in_yaml and ':' in line:
            key = line.split(':')[0].strip()
            yaml_lines[key] = i
    
    return yaml_lines, start_line, end_line

def check_agent_compliance(file_path: Path) -> Dict:
    """Check agent file for compliance issues"""
    issues = []
    warnings = []
    
    try:
        content = file_path.read_text()
    except Exception as e:
        return {
            'file': str(file_path),
            'compliant': False,
            'issues': [f"Cannot read file: {e}"],
            'warnings': [],
            'attributes': {}
        }
    
    yaml_attrs, start, end = extract_yaml_frontmatter(content)
    
    # Check for YAML frontmatter
    if start == -1:
        issues.append("Missing YAML frontmatter (---)")
        return {
            'file': str(file_path),
            'compliant': False,
            'issues': issues,
            'warnings': warnings,
            'attributes': {}
        }
    
    # Check for unsupported attributes
    for attr, line_num in yaml_attrs.items():
        if attr in UNSUPPORTED_ATTRS:
            issues.append(f"Unsupported attribute '{attr}' at line {line_num}")
    
    # Check for model aliases
    model_line = None
    for line in content.split('\n'):
        if line.strip().startswith('model:'):
            model_value = line.split(':', 1)[1].strip()
            if model_value in ['sonnet', 'gpt4', 'gpt-4-turbo']:
                warnings.append(f"Model alias '{model_value}' (use full name)")
            break
    
    # Check for required attributes
    if 'name' not in yaml_attrs and 'description' not in yaml_attrs:
        warnings.append("Missing 'name' and 'description' (recommended)")
    
    compliant = len(issues) == 0
    
    return {
        'file': str(file_path),
        'compliant': compliant,
        'issues': issues,
        'warnings': warnings,
        'attributes': yaml_attrs
    }

def generate_report(results: List[Dict], workspace: str) -> str:
    """Generate markdown compliance report"""
    total = len(results)
    compliant = sum(1 for r in results if r['compliant'])
    non_compliant = total - compliant
    total_issues = sum(len(r['issues']) for r in results)
    total_warnings = sum(len(r['warnings']) for r in results)
    
    report = []
    report.append("# Custom Agent Compliance Report")
    report.append("")
    report.append(f"**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append(f"**Workspace**: {workspace}")
    report.append(f"**Total Agents**: {total}")
    report.append("")
    report.append("## Summary")
    report.append("")
    report.append(f"- ✅ **Compliant**: {compliant}")
    report.append(f"- ❌ **Non-Compliant**: {non_compliant}")
    report.append(f"- 🔴 **Total Issues**: {total_issues}")
    report.append(f"- ⚠️  **Total Warnings**: {total_warnings}")
    report.append("")
    
    # Non-compliant files
    if non_compliant > 0:
        report.append("## ❌ Non-Compliant Agents")
        report.append("")
        for result in results:
            if not result['compliant']:
                report.append(f"### {Path(result['file']).name}")
                report.append("")
                report.append(f"**Path**: `{result['file']}`")
                report.append("")
                report.append("**Issues**:")
                for issue in result['issues']:
                    report.append(f"- {issue}")
                if result['warnings']:
                    report.append("")
                    report.append("**Warnings**:")
                    for warning in result['warnings']:
                        report.append(f"- {warning}")
                report.append("")
    
    # Warnings only
    warnings_only = [r for r in results if r['compliant'] and r['warnings']]
    if warnings_only:
        report.append("## ⚠️  Compliant with Warnings")
        report.append("")
        for result in warnings_only:
            report.append(f"### {Path(result['file']).name}")
            report.append("")
            report.append(f"**Path**: `{result['file']}`")
            report.append("")
            report.append("**Warnings**:")
            for warning in result['warnings']:
                report.append(f"- {warning}")
            report.append("")
    
    # Fully compliant
    fully_compliant = [r for r in results if r['compliant'] and not r['warnings']]
    if fully_compliant:
        report.append("## ✅ Fully Compliant Agents")
        report.append("")
        for result in fully_compliant:
            report.append(f"- `{Path(result['file']).name}` ({result['file']})")
        report.append("")
    
    # Remediation
    if non_compliant > 0:
        report.append("## Remediation Steps")
        report.append("")
        report.append("1. Run the fix-agent-compliance prompt for each non-compliant agent")
        report.append("2. Move unsupported attributes to markdown body")
        report.append("3. Fix model aliases to use full names")
        report.append("4. Re-run this scan to verify fixes" in workspace{Colors.RESET}")
        print()
        print("This is normal if:")
        print("  - You haven't created custom agents yet")
        print("  - Agents are located in non-standard directories")
        print()
        print("Searched locations:")
        print("  - .github/agents/")
        print("  - .github/skills/")
        print("  - agents/")
        print("  - skills/")
        print()
        print("To create custom agents, see:")
        print("  https://code.visualstudio.com/docs/copilot/customization/custom-agents
        report.append("")
        report.append("**Reference**: https://code.visualstudio.com/docs/copilot/customization/custom-agents")
        report.append("")
    
    return "\n".join(report)

def main():
    workspace = sys.argv[1] if len(sys.argv) > 1 else '.'
    workspace = os.path.abspath(workspace)
    
    print(f"{Colors.BLUE}=== Custom Agent Workspace Scanner ==={Colors.RESET}")
    print()
    print(f"Scanning workspace: {Colors.YELLOW}{workspace}{Colors.RESET}")
    print()
    
    # Find all agent files
    agent_files = find_agent_files(workspace)
    
    if not agent_files:
        print(f"{Colors.YELLOW}⚠️  No .agent.md files found{Colors.RESET}")
        return 0
    
    print(f"Found {len(agent_files)} agent file(s)")
    print()
    
    # Check each file
    results = []
    for agent_file in agent_files:
        rel_path = agent_file.relative_to(workspace)
        print(f"Checking: {rel_path}")
        result = check_agent_compliance(agent_file)
        results.append(result)
        
        if result['compliant']:
            if result['warnings']:
                print(f"  {Colors.YELLOW}⚠️  Compliant with warnings{Colors.RESET}")
            else:
                print(f"  {Colors.GREEN}✅ Compliant{Colors.RESET}")
        else:
            print(f"  {Colors.RED}❌ Non-compliant ({len(result['issues'])} issues){Colors.RESET}")
        print()
    
    # Generate report
    report = generate_report(results, workspace)
    report_file = Path(workspace) / 'agent-compliance-report.md'
    report_file.write_text(report)
    
    # Summary
    compliant = sum(1 for r in results if r['compliant'])
    non_compliant = len(results) - compliant
    
    print("---")
    print(f"{Colors.BLUE}=== Summary ==={Colors.RESET}")
    print(f"Total agents: {len(results)}")
    print(f"{Colors.GREEN}✅ Compliant: {compliant}{Colors.RESET}")
    print(f"{Colors.RED}❌ Non-compliant: {non_compliant}{Colors.RESET}")
    print()
    print(f"{Colors.BLUE}📄 Report saved: {report_file}{Colors.RESET}")
    
    return 1 if non_compliant > 0 else 0

if __name__ == '__main__':
    sys.exit(main())
