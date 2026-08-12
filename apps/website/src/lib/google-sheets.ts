const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets"

export interface SheetsFetchParams {
  spreadsheetId: string
  range: string
  apiKey: string
}

interface SheetsValuesResponse {
  range: string
  majorDimension: string
  values?: string[][]
}

export class SheetsFetchError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "SheetsFetchError"
    this.status = status
  }
}

/**
 * Fetch raw rows from a Google Sheet as a 2D string array.
 * First row is the header row, callers are responsible for interpreting it.
 *
 * Throws SheetsFetchError on non-2xx responses.
 */
export const fetchSheetValues = async ({
  spreadsheetId,
  range,
  apiKey,
}: SheetsFetchParams): Promise<string[][]> => {
  if (!spreadsheetId) {
    throw new SheetsFetchError("Missing spreadsheetId", 400)
  }
  if (!apiKey) {
    throw new SheetsFetchError("Missing Google Sheets API key", 500)
  }

  const encodedRange = encodeURIComponent(range)
  const url =
    `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodedRange}` +
    `?key=${apiKey}&valueRenderOption=FORMATTED_VALUE` +
    `&dateTimeRenderOption=FORMATTED_STRING`

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new SheetsFetchError(
      `Sheets API ${res.status}: ${body.slice(0, 300)}`,
      res.status
    )
  }

  const data = (await res.json()) as SheetsValuesResponse
  return data.values ?? []
}
