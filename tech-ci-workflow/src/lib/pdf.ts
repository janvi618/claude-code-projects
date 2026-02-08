import { chromium } from 'playwright'
import { marked } from 'marked'
import path from 'path'
import fs from 'fs'

const EXPORTS_DIR = path.join(process.cwd(), 'exports')

// Ensure exports directory exists
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true })
}

interface Source {
  id: string
  url?: string | null
  note?: string | null
}

export async function generatePDF(
  markdown: string,
  sources: Source[],
  projectTitle: string
): Promise<string> {
  const html = marked(markdown) as string
  
  const citationsList = sources.length > 0
    ? sources.map((s, i) => `<li>[S${i + 1}] ${s.url || s.note || 'Source'}</li>`).join('')
    : '<li>No external sources cited</li>'

  const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${projectTitle} - Executive Summary</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3 { color: #1a1a1a; margin-top: 1.5em; }
    h1 { border-bottom: 2px solid #2563eb; padding-bottom: 0.5em; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f3f4f6; }
    .citations { margin-top: 2em; padding-top: 1em; border-top: 1px solid #ddd; }
    .footer { 
      margin-top: 2em; 
      padding: 1em; 
      background: #f3f4f6; 
      font-size: 0.9em;
      border-radius: 4px;
    }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f3f4f6; padding: 1em; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${projectTitle}</h1>
  ${html}
  
  <div class="citations">
    <h3>Sources</h3>
    <ul>${citationsList}</ul>
  </div>
  
  <div class="footer">
    <strong>Disclaimer:</strong> For competitive intelligence and strategy use; not legal advice; no IP invention.
    <br><br>
    Generated: ${new Date().toISOString().split('T')[0]}
  </div>
</body>
</html>
`

  const filename = `${projectTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`
  const filePath = path.join(EXPORTS_DIR, filename)

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setContent(fullHtml, { waitUntil: 'networkidle' })
  await page.pdf({
    path: filePath,
    format: 'A4',
    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    printBackground: true
  })
  await browser.close()

  return filename
}
