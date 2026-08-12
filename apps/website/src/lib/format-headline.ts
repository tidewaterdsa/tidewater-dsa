export interface HeadlineParts {
  before: string
  accent: string | null
  after: string
}

export const splitHighlight = (raw: string): HeadlineParts => {
  const match = raw.match(/^(.*?)\*([^*]+)\*(.*)$/)

  if (!match) return { before: raw, accent: null, after: "" }

  return { before: match[1], accent: match[2], after: match[3] }
}
