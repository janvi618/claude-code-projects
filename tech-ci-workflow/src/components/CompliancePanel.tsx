"use client"

import { useMemo } from 'react'

interface CompliancePanelProps {
  content: string
}

interface ComplianceFlag {
  type: 'ip' | 'pii'
  pattern: string
  match: string
  line: number
}

const IP_PATTERNS = [
  /\bpatent(?:ed)?\b/gi,
  /\bnovel invention\b/gi,
  /\bwe invented\b/gi,
  /\bproprietary method\b/gi,
  /\bfile a patent\b/gi,
]

const PII_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // emails
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // phone numbers
]

export function CompliancePanel({ content }: CompliancePanelProps) {
  const flags = useMemo(() => {
    const results: ComplianceFlag[] = []
    const lines = content.split('\n')

    lines.forEach((line, lineNum) => {
      // Check IP patterns
      IP_PATTERNS.forEach(pattern => {
        const matches = line.match(pattern)
        if (matches) {
          matches.forEach(match => {
            results.push({
              type: 'ip',
              pattern: pattern.source,
              match,
              line: lineNum + 1
            })
          })
        }
      })

      // Check PII patterns
      PII_PATTERNS.forEach(pattern => {
        const matches = line.match(pattern)
        if (matches) {
          matches.forEach(match => {
            results.push({
              type: 'pii',
              pattern: pattern.source,
              match,
              line: lineNum + 1
            })
          })
        }
      })
    })

    return results
  }, [content])

  const ipFlags = flags.filter(f => f.type === 'ip')
  const piiFlags = flags.filter(f => f.type === 'pii')

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold text-gray-700 mb-3">Compliance Check</h3>

      {flags.length === 0 ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          ✓ No compliance issues detected
        </div>
      ) : (
        <div className="space-y-3">
          {ipFlags.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <h4 className="font-medium text-red-700 text-sm mb-2">
                ⚠️ IP Invention Language ({ipFlags.length})
              </h4>
              <ul className="text-sm text-red-600 space-y-1">
                {ipFlags.map((flag, idx) => (
                  <li key={idx}>
                    Line {flag.line}: "{flag.match}"
                  </li>
                ))}
              </ul>
            </div>
          )}

          {piiFlags.length > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
              <h4 className="font-medium text-orange-700 text-sm mb-2">
                ⚠️ Potential PII ({piiFlags.length})
              </h4>
              <ul className="text-sm text-orange-600 space-y-1">
                {piiFlags.map((flag, idx) => (
                  <li key={idx}>
                    Line {flag.line}: "{flag.match}"
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function hasComplianceIssues(content: string): boolean {
  const allPatterns = [...IP_PATTERNS, ...PII_PATTERNS]
  return allPatterns.some(pattern => pattern.test(content))
}
