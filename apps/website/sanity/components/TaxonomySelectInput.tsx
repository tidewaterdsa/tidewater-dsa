import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { useClient, set, unset, type StringInputProps } from "sanity"
import { Select, Stack, Text } from "@sanity/ui"
import { SANITY_API_VERSION } from "@/lib/sanity-config"

interface TaxonomyEntry {
  label: string | null
  value: { current: string | null } | null
}

interface TaxonomyOption {
  label: string
  value: string
}

interface TaxonomyLabels {
  /**
   * Plural noun, lowercase, used in the error and loading states.
   * e.g. "event types", "working groups".
   */
  taxonomyName: string
  /**
   * The Settings document's display name, used in the empty-state message pointing admins at where to create entries.
   * e.g. "Event Types", "Working Groups".
   */
  settingsDocName: string
}

interface TaxonomySelectInputProps extends StringInputProps {
  /**
   * GROQ query that resolves to an array of `{ label, value }` where value is a slug object.
   * Each concrete input supplies its own (different taxonomy doc, different array field name).
   */
  query: string
  labels: TaxonomyLabels
}

const getErrorMessage = (err: Error | string): string =>
  err instanceof Error ? err.message : err

export const TaxonomySelectInput = ({
  query,
  labels,
  value,
  onChange,
  readOnly,
  elementProps,
}: TaxonomySelectInputProps) => {
  const [entries, setEntries] = useState<TaxonomyEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const client = useClient({ apiVersion: SANITY_API_VERSION })

  useEffect(() => {
    let active = true

    client
      .fetch<TaxonomyEntry[] | null>(query)
      .then((result) => {
        if (active) setEntries(result ?? [])
      })
      .catch((err: Error) => {
        if (active) setError(getErrorMessage(err))
      })

    return () => {
      active = false
    }
  }, [client, query])

  const options: TaxonomyOption[] = useMemo(() => {
    if (!entries) return []

    const result: TaxonomyOption[] = []

    for (const entry of entries) {
      const label = entry.label ?? ""
      const slug = entry.value?.current ?? ""
      if (label && slug) result.push({ label, value: slug })
    }

    return result
  }, [entries])

  const isOrphan = Boolean(
    value && options.length > 0 && !options.some((o) => o.value === value)
  )

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.currentTarget.value
    onChange(next ? set(next) : unset())
  }

  if (error) {
    return (
      <Stack space={2}>
        <Text size={1} muted>
          Could not load {labels.taxonomyName}: {error}
        </Text>
      </Stack>
    )
  }

  if (!entries) {
    return (
      <Text size={1} muted>
        Loading {labels.taxonomyName}…
      </Text>
    )
  }

  if (options.length === 0) {
    return (
      <Stack space={2}>
        <Text size={1} muted>
          No {labels.taxonomyName} defined yet. Create entries in the{" "}
          <strong>{labels.settingsDocName}</strong> document under Settings to
          enable this dropdown.
        </Text>
      </Stack>
    )
  }

  return (
    <Select
      {...elementProps}
      value={value ?? ""}
      onChange={handleChange}
      readOnly={readOnly}
    >
      <option value="">— None —</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}

      {isOrphan && value && (
        <option value={value}>{value} (not in taxonomy)</option>
      )}
    </Select>
  )
}
