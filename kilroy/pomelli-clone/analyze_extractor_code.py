#!/usr/bin/env python3
"""
Code Analysis Script for Brand DNA Extractor
Validates the TypeScript implementation against requirements
"""

import os
import re
import json
from typing import Dict, List, Tuple, Any

def read_file_content(file_path: str) -> str:
    """Read file content safely"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error reading {file_path}: {e}"

def analyze_types_file() -> Tuple[bool, List[str]]:
    """Analyze types.ts for BrandDNA structure compliance"""
    print("Analyzing types.ts...")
    content = read_file_content('src/extractor/types.ts')
    issues = []
    
    # Check for BrandDNA interface
    if 'export interface BrandDNA' not in content:
        issues.append("Missing BrandDNA interface export")
        return False, issues
    
    # Check required top-level fields
    required_fields = [
        'url: string',
        'extracted_at: string',
        'confidence: number',
        'colors:',
        'typography:',
        'imagery:',
        'voice:',
        'positioning:',
        'meta:'
    ]
    
    for field in required_fields:
        if field not in content:
            issues.append(f"Missing required field: {field}")
    
    # Check colors structure
    color_fields = [
        'primary: string[]',
        'secondary: string[]',
        'background: string',
        'text: string',
        'accent: string | null'
    ]
    
    for field in color_fields:
        if field not in content:
            issues.append(f"Missing colors field: {field}")
    
    # Check confidence comment
    if '// 0.0 to 1.0' not in content:
        issues.append("Missing confidence range documentation")
    
    print(f"  Found {len(issues)} issues in types definition")
    return len(issues) == 0, issues

def analyze_main_extractor() -> Tuple[bool, List[str]]:
    """Analyze index.ts for main extractor logic"""
    print("Analyzing index.ts...")
    content = read_file_content('src/extractor/index.ts')
    issues = []
    
    # Check main export function
    if 'export async function extract(' not in content:
        issues.append("Missing main extract function export")
    
    # Check error handling - should return BrandDNA with confidence 0
    if 'confidence: 0' not in content:
        issues.append("Missing confidence 0 handling in error cases")
    
    # Check return type Promise<BrandDNA>
    if 'Promise<BrandDNA>' not in content:
        issues.append("Extract function should return Promise<BrandDNA>")
    
    # Check timeout handling
    if 'timeout' not in content.lower():
        issues.append("Missing timeout handling")
    
    # Check URL normalization
    if 'normalizeUrl' not in content:
        issues.append("Missing URL normalization")
    
    # Check confidence calculation
    if 'calculateConfidence' not in content:
        issues.append("Missing confidence calculation function")
    
    # Check error catch block
    if 'catch (error)' not in content:
        issues.append("Missing error handling with catch block")
    
    # Check graceful error return
    error_return_pattern = r'return\s*{[^}]*confidence:\s*0'
    if not re.search(error_return_pattern, content, re.DOTALL):
        issues.append("Error cases should return BrandDNA object with confidence 0")
    
    print(f"  Found {len(issues)} issues in main extractor")
    return len(issues) == 0, issues

def analyze_utils() -> Tuple[bool, List[str]]:
    """Analyze utils.ts for URL validation"""
    print("Analyzing utils.ts...")
    content = read_file_content('src/extractor/utils.ts')
    issues = []
    
    # Check normalizeUrl function
    if 'export' not in content and 'normalizeUrl' not in content:
        issues.append("Missing normalizeUrl function export")
    
    # Should handle URL formatting
    if 'http' not in content.lower():
        issues.append("URL normalization should handle HTTP protocol")
    
    print(f"  Found {len(issues)} issues in utils")
    return len(issues) == 0, issues

def analyze_test_runner() -> Tuple[bool, List[str]]:
    """Analyze test-extractor.js for test completeness"""
    print("Analyzing test-extractor.js...")
    content = read_file_content('src/extractor/test-extractor.js')
    issues = []
    
    # Check for invalid URL test
    if "'not-a-url'" not in content:
        issues.append("Missing invalid URL test case")
    
    # Check for valid URL test (example.com)
    if 'example.com' not in content:
        issues.append("Missing example.com test case")
    
    # Check for confidence checking
    if 'confidence' not in content:
        issues.append("Tests should check confidence values")
    
    # Check for graceful error handling
    if 'gracefully' not in content:
        issues.append("Tests should verify graceful error handling")
    
    print(f"  Found {len(issues)} issues in test runner")
    return len(issues) == 0, issues

def check_hex_color_validation() -> Tuple[bool, List[str]]:
    """Check if hex color validation is implemented"""
    print("Checking hex color validation...")
    issues = []
    
    # Look for hex color validation in visual analyzer or utils
    visual_content = read_file_content('src/extractor/visual-analyzer.ts')
    utils_content = read_file_content('src/extractor/utils.ts')
    
    hex_pattern_found = False
    for content in [visual_content, utils_content]:
        if re.search(r'#[0-9A-Fa-f]{6}', content):
            hex_pattern_found = True
            break
    
    if not hex_pattern_found:
        issues.append("No hex color validation pattern found")
    
    # Check if colors are properly formatted in default error return
    main_content = read_file_content('src/extractor/index.ts')
    if "#FFFFFF" not in main_content or "#000000" not in main_content:
        issues.append("Default error colors should be valid hex codes")
    
    print(f"  Found {len(issues)} issues in hex color validation")
    return len(issues) == 0, issues

def check_dependency_structure() -> Tuple[bool, List[str]]:
    """Check package.json and dependencies"""
    print("Checking dependencies...")
    issues = []
    
    package_content = read_file_content('package.json')
    try:
        package_data = json.loads(package_content)
        
        # Check required dependencies
        deps = package_data.get('dependencies', {})
        required_deps = ['cheerio', 'axios']  # Based on web scraping needs
        
        for dep in required_deps:
            if dep not in deps:
                issues.append(f"Missing required dependency: {dep}")
        
        # Check module type
        if package_data.get('type') != 'module':
            issues.append("Package should be configured as ES module")
            
    except json.JSONDecodeError:
        issues.append("Invalid package.json format")
    
    print(f"  Found {len(issues)} dependency issues")
    return len(issues) == 0, issues

def main():
    """Run all code analysis checks"""
    print("Brand DNA Extractor Code Analysis")
    print("=" * 50)
    
    all_checks = [
        ("TypeScript Types", analyze_types_file),
        ("Main Extractor", analyze_main_extractor),
        ("Utilities", analyze_utils),
        ("Test Runner", analyze_test_runner),
        ("Hex Color Validation", check_hex_color_validation),
        ("Dependencies", check_dependency_structure)
    ]
    
    total_passed = 0
    all_issues = []
    
    for check_name, check_func in all_checks:
        print(f"\n{check_name}:")
        try:
            passed, issues = check_func()
            if passed:
                print(f"  ✓ PASSED")
                total_passed += 1
            else:
                print(f"  ✗ FAILED ({len(issues)} issues)")
                for issue in issues:
                    print(f"    - {issue}")
            all_issues.extend([(check_name, issue) for issue in issues])
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            all_issues.append((check_name, f"Check failed: {e}"))
    
    print("\n" + "=" * 50)
    print("Summary:")
    print(f"Passed: {total_passed}/{len(all_checks)} checks")
    
    if all_issues:
        print(f"Total Issues: {len(all_issues)}")
        print("\nAll Issues:")
        for check, issue in all_issues:
            print(f"  [{check}] {issue}")
    else:
        print("All checks passed!")
    
    return len(all_issues) == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)