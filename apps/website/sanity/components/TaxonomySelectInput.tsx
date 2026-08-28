import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { useClient, set, unset, type StringInputProps } from "sanity"
import { useIntentLink } from "sanity/router"
import { Button, Card, Flex, Select, Stack, Text } from "@sanity/ui"
import { ArrowRightIcon, WarningOutlineIcon } from "@sanity/icons"
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
  /** Schema type of the singleton holding the entries, for the empty state's link. */
  settingsDocType: string
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

  // SINGLETON_IDS gives each singleton an id matching its type.
  const { onClick: openSettingsDoc } = useIntentLink({
    intent: "edit",
    params: { id: labels.settingsDocType, type: labels.settingsDocType },
  })

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
      <Card padding={3} radius={2} tone="critical" border>
        <Flex align="flex-start" gap={3}>
          <Text size={1}>
            <WarningOutlineIcon />
          </Text>
          <Stack space={2} flex={1}>
            <Text size={1} weight="medium">
              Could not load {labels.taxonomyName}
            </Text>
            <Text size={1}>{error}</Text>
          </Stack>
        </Flex>
      </Card>
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
      <Card padding={3} radius={2} tone="caution" border>
        <Stack space={3}>
          <Text size={1}>
            No {labels.taxonomyName} defined yet. Create entries in{" "}
            <strong>{labels.settingsDocName}</strong> to enable this dropdown.
          </Text>
          <Flex>
            <Button
              mode="ghost"
              iconRight={ArrowRightIcon}
              text={`Open ${labels.settingsDocName}`}
              onClick={openSettingsDoc}
            />
          </Flex>
        </Stack>
      </Card>
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
