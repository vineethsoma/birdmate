#!/usr/bin/env python3
"""
validate-agent-skill.py
Validates Agent Skill directory structure and SKILL.md compliance
Official spec: https://agentskills.io/specification
"""

import os
import sys
import re
import yaml
from pathlib import Path
from typing import Dict, List, Tuple

# ANSI colors
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    RESET = '\033[0m'

def validate_skill_name(name: str, dir_name: str) -> List[str]:
    """Validate skill name against spec requirements"""
    errors = []
    
    # Check length
    if len(name) < 1 or len(name) > 64:
        errors.append(f"Name must be 1-64 characters (got {len(name)})")
    
    # Check pattern: lowercase alphanumeric + hyphens
    if not re.match(r'^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$|^[a-z0-9]$', name):
        if name[0] == '-':
            errors.append("Name cannot start with hyphen")
        elif name[-1] == '-':
            errors.append("Name cannot end with hyphen")
        elif '--' in name:
            errors.append("Name cannot contain consecutive hyphens")
        elif not name.islower():
            errors.append("Name must be lowercase")
        elif '_' in name:
            errors.append("Name cannot contain underscores (use hyphens)")
        else:
            errors.append("Name must contain only lowercase letters, numbers, and hyphens")
    
    # Check matches directory name
    if name != dir_name:
        errors.append(f"Name '{name}' doesn't match directory '{dir_name}'")
    
    return errors

def validate_description(description: str) -> List[str]:
    """Validate description field"""
    errors = []
    
    if not description or len(description.strip()) == 0:
        errors.append("Description cannot be empty")
    elif len(description) < 1 or len(description) > 1024:
        errors.append(f"Description must be 1-1024 characters (got {len(description)})")
    
    # Check if description is too vague
    vague_patterns = [
        r'^helps with \w+$',
        r'^does stuff$',
        r'^handles \w+$',
    ]
    desc_lower = description.lower().strip()
    for pattern in vague_patterns:
        if re.match(pattern, desc_lower):
            errors.append(f"Description too vague: '{description[:50]}...'")
            break
    
    return errors

def validate_compatibility(compatibility: str) -> List[str]:
    """Validate compatibility field"""
    errors = []
    
    if compatibility and len(compatibility) > 500:
        errors.append(f"Compatibility must be ≤500 characters (got {len(compatibility)})")
    
    return errors

def parse_skill_frontmatter(content: str) -> Tuple[Dict, List[str]]:
    """Parse and validate YAML frontmatter"""
    errors = []
    frontmatter = {}
    
    # Check for frontmatter delimiters
    if not content.startswith('---\n'):
        errors.append("SKILL.md must start with '---' YAML delimiter")
        return frontmatter, errors
    
    # Extract frontmatter
    parts = content.split('---\n', 2)
    if len(parts) < 3:
        errors.append("SKILL.md missing closing '---' YAML delimiter")
        return frontmatter, errors
    
    yaml_content = parts[1]
    
    # Parse YAML
    try:
        frontmatter = yaml.safe_load(yaml_content)
        if not isinstance(frontmatter, dict):
            errors.append("Frontmatter must be a YAML dictionary")
            return {}, errors
    except yaml.YAMLError as e:
        errors.append(f"Invalid YAML in frontmatter: {e}")
        return {}, errors
    
    return frontmatter, errors

def validate_skill_directory(skill_path: Path) -> Dict:
    """Validate complete skill directory structure"""
    errors = []
    warnings = []
    
    skill_name = skill_path.name
    
    # Check SKILL.md exists
    skill_md = skill_path / 'SKILL.md'
    if not skill_md.exists():
        return {
            'path': str(skill_path),
            'compliant': False,
            'errors': ['SKILL.md not found at skill root'],
            'warnings': [],
            'frontmatter': {}
        }
    
    # Read SKILL.md
    try:
        content = skill_md.read_text(encoding='utf-8')
    except Exception as e:
        return {
            'path': str(skill_path),
            'compliant': False,
            'errors': [f'Cannot read SKILL.md: {e}'],
            'warnings': [],
            'frontmatter': {}
        }
    
    # Parse frontmatter
    frontmatter, parse_errors = parse_skill_frontmatter(content)
    errors.extend(parse_errors)
    
    if not parse_errors:
        # Validate required fields
        if 'name' not in frontmatter:
            errors.append("Missing required field 'name' in frontmatter")
        else:
            name_errors = validate_skill_name(frontmatter['name'], skill_name)
            errors.extend(name_errors)
        
        if 'description' not in frontmatter:
            errors.append("Missing required field 'description' in frontmatter")
        else:
            desc_errors = validate_description(frontmatter['description'])
            errors.extend(desc_errors)
        
        # Validate optional fields
        if 'compatibility' in frontmatter:
            compat_errors = validate_compatibility(frontmatter['compatibility'])
            errors.extend(compat_errors)
        
        # Check for unsupported fields (common mistakes)
        unsupported_fields = {'version', 'author', 'type'}
        for field in frontmatter.keys():
            if field in unsupported_fields:
                warnings.append(f"Field '{field}' should be in 'metadata' instead of top-level")
    
    # Check body content length (recommended < 500 lines)
    lines = content.split('\n')
    if len(lines) > 500:
        warnings.append(f"SKILL.md has {len(lines)} lines (recommended: < 500). Consider moving content to references/")
    
    # Check optional directories
    optional_dirs = {
        'scripts': 'Executable code',
        'references': 'Detailed documentation',
        'assets': 'Static resources'
    }
    
    for dir_name, purpose in optional_dirs.items():
        dir_path = skill_path / dir_name
        if dir_path.exists():
            if not dir_path.is_dir():
                errors.append(f"'{dir_name}' exists but is not a directory")
            else:
                # Check if directory has content
                contents = list(dir_path.iterdir())
                if not contents:
                    warnings.append(f"'{dir_name}/' directory is empty")
    
    # Check for deeply nested references
    if (skill_path / 'references').exists():
        for ref_file in (skill_path / 'references').rglob('*'):
            if ref_file.is_file():
                depth = len(ref_file.relative_to(skill_path / 'references').parts)
                if depth > 1:
                    warnings.append(f"Deep nesting in references: {ref_file.relative_to(skill_path)}")
    
    return {
        'path': str(skill_path),
        'compliant': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'frontmatter': frontmatter
    }

def generate_report(results: Dict) -> str:
    """Generate validation report"""
    report = []
    report.append("# Agent Skill Validation Report")
    report.append("")
    report.append(f"**Skill**: {Path(results['path']).name}")
    report.append(f"**Path**: `{results['path']}`")
    report.append(f"**Status**: {'✅ Compliant' if results['compliant'] else '❌ Non-Compliant'}")
    report.append("")
    
    if results['frontmatter']:
        report.append("## Frontmatter")
        report.append("")
        report.append("```yaml")
        for key, value in results['frontmatter'].items():
            if isinstance(value, dict):
                report.append(f"{key}:")
                for k, v in value.items():
                    report.append(f"  {k}: {v}")
            else:
                report.append(f"{key}: {value}")
        report.append("```")
        report.append("")
    
    if results['errors']:
        report.append("## ❌ Errors")
        report.append("")
        for error in results['errors']:
            report.append(f"- {error}")
        report.append("")
    
    if results['warnings']:
        report.append("## ⚠️  Warnings")
        report.append("")
        for warning in results['warnings']:
            report.append(f"- {warning}")
        report.append("")
    
    if not results['errors'] and not results['warnings']:
        report.append("## ✅ Fully Compliant")
        report.append("")
        report.append("This skill passes all validation checks!")
        report.append("")
    
    report.append("---")
    report.append("")
    report.append("**Reference**: https://agentskills.io/specification")
    
    return "\n".join(report)

def main():
    if len(sys.argv) < 2:
        print(f"{Colors.RED}Usage: python3 validate-agent-skill.py <skill-directory>{Colors.RESET}")
        print()
        print("Examples:")
        print("  python3 validate-agent-skill.py ./skills/my-skill")
        print("  python3 validate-agent-skill.py .")
        print()
        print("Validates Agent Skill compliance with official specification.")
        print("See: https://agentskills.io/specification")
        sys.exit(1)
    
    skill_path = Path(sys.argv[1]).resolve()
    
    if not skill_path.exists():
        print(f"{Colors.RED}❌ Error: Directory not found: {skill_path}{Colors.RESET}")
        sys.exit(1)
    
    if not skill_path.is_dir():
        print(f"{Colors.RED}❌ Error: Path is not a directory: {skill_path}{Colors.RESET}")
        sys.exit(1)
    
    print(f"{Colors.BLUE}=== Agent Skill Validator ==={Colors.RESET}")
    print()
    print(f"Validating: {Colors.YELLOW}{skill_path.name}{Colors.RESET}")
    print()
    
    # Validate
    results = validate_skill_directory(skill_path)
    
    # Display results
    if results['compliant']:
        if results['warnings']:
            print(f"{Colors.YELLOW}⚠️  Compliant with warnings{Colors.RESET}")
        else:
            print(f"{Colors.GREEN}✅ Fully compliant!{Colors.RESET}")
    else:
        print(f"{Colors.RED}❌ Non-compliant{Colors.RESET}")
    
    print()
    
    if results['errors']:
        print(f"{Colors.RED}Errors ({len(results['errors'])}): {Colors.RESET}")
        for error in results['errors']:
            print(f"  • {error}")
        print()
    
    if results['warnings']:
        print(f"{Colors.YELLOW}Warnings ({len(results['warnings'])}): {Colors.RESET}")
        for warning in results['warnings']:
            print(f"  • {warning}")
        print()
    
    # Generate report
    report = generate_report(results)
    report_file = skill_path / 'skill-validation-report.md'
    try:
        report_file.write_text(report, encoding='utf-8')
        print(f"{Colors.BLUE}📄 Report saved: {report_file}{Colors.RESET}")
    except Exception as e:
        print(f"{Colors.YELLOW}⚠️  Could not save report: {e}{Colors.RESET}")
    
    # Exit code
    sys.exit(0 if results['compliant'] else 1)

if __name__ == '__main__':
    main()
