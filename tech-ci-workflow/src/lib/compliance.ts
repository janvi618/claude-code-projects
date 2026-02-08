// Simple compliance checker for guardrails

export interface ComplianceIssue {
  type: 'ip_invention' | 'personal_data' | 'confidential';
  severity: 'warning' | 'error';
  text: string;
  suggestion: string;
}

const IP_PATTERNS = [
  /we\s+invented/gi,
  /novel\s+method/gi,
  /patent\s+this/gi,
  /our\s+invention/gi,
  /proprietary\s+algorithm/gi,
  /unique\s+innovation/gi,
  /first\s+to\s+develop/gi,
];

const PERSONAL_DATA_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
];

const CONFIDENTIAL_PATTERNS = [
  /confidential/gi,
  /internal\s+only/gi,
  /do\s+not\s+distribute/gi,
  /proprietary\s+information/gi,
];

export function checkCompliance(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  // Check for IP invention language
  for (const pattern of IP_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        issues.push({
          type: 'ip_invention',
          severity: 'error',
          text: match,
          suggestion: 'Remove or rephrase language that implies invention of new IP. This tool is for competitive intelligence only.',
        });
      }
    }
  }

  // Check for personal data
  for (const pattern of PERSONAL_DATA_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        issues.push({
          type: 'personal_data',
          severity: 'warning',
          text: match,
          suggestion: 'Personal data detected. Consider removing or anonymizing before export.',
        });
      }
    }
  }

  // Check for confidential markers
  for (const pattern of CONFIDENTIAL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        issues.push({
          type: 'confidential',
          severity: 'warning',
          text: match,
          suggestion: 'Confidential content marker detected. Ensure appropriate handling.',
        });
      }
    }
  }

  return issues;
}

export function hasBlockingIssues(issues: ComplianceIssue[]): boolean {
  return issues.some(i => i.severity === 'error');
}
