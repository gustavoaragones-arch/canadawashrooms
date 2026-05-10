/**
 * RFC4180-style CSV rows for Outscraper Google Maps exports.
 * No network I/O — pass file contents as string (local ingest workflows).
 */

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (c === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  out.push(cur)
  return out.map((c) => c.trim())
}

export interface CsvMalformedRow {
  lineNumber: number
  reason: string
  rawPreview: string
}

export interface CsvParseDiagnostics {
  headerColumnCount: number
  bodyRowCount: number
  malformedRows: CsvMalformedRow[]
}

export function parseOutscraperCsv(csvText: string): Record<string, string>[] {
  const { rows } = parseOutscraperCsvWithDiagnostics(csvText)
  return rows
}

/**
 * Deterministic CSV parse with column-count drift detection — invalid rows are isolated, not merged silently.
 */
export function parseOutscraperCsvWithDiagnostics(csvText: string): {
  rows: Record<string, string>[]
  diagnostics: CsvParseDiagnostics
} {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)
  const malformedRows: CsvMalformedRow[] = []

  if (lines.length === 0) {
    return {
      rows: [],
      diagnostics: { headerColumnCount: 0, bodyRowCount: 0, malformedRows },
    }
  }

  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
  const headerColumnCount = header.length
  const rows: Record<string, string>[] = []

  for (let li = 1; li < lines.length; li++) {
    const lineNo = li + 1
    const cells = parseCsvLine(lines[li])
    if (cells.length === 1 && cells[0] === '') continue

    if (cells.length !== headerColumnCount) {
      malformedRows.push({
        lineNumber: lineNo,
        reason: `column_count_mismatch expected ${headerColumnCount} got ${cells.length}`,
        rawPreview: lines[li].slice(0, 240),
      })
      continue
    }

    const row: Record<string, string> = {}
    for (let i = 0; i < header.length; i++) {
      row[header[i]] = cells[i] ?? ''
    }
    rows.push(row)
  }

  return {
    rows,
    diagnostics: {
      headerColumnCount,
      bodyRowCount: rows.length,
      malformedRows,
    },
  }
}
