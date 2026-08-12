import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react"
import {
  set,
  unset,
  useFormValue,
  type ObjectInputProps,
  type Path,
} from "sanity"
import { Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui"
import { EditIcon, LockIcon } from "@sanity/icons"

interface SlugValue {
  _type?: "slug"
  current?: string
}

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)

export const AutoSlugFromLabelInput = ({
  value,
  onChange,
  readOnly,
  path,
}: ObjectInputProps<SlugValue>) => {
  const [unlocked, setUnlocked] = useState(false)

  // Read the sibling label field.
  // path is like ["types", {_key: "abc"}, "value"] (or ["groups", ...]),
  // so the label sibling lives at path[0..n-1] + "label".
  const labelPath: Path = [...path.slice(0, -1), "label"]
  const label = useFormValue(labelPath) as string | undefined

  const current = value?.current ?? ""

  // Track whether the admin has manually edited the slug. If they have, stop auto-filling.
  const manuallyEditedRef = useRef(false)

  const applySlug = useCallback(
    (nextCurrent: string) => {
      if (!nextCurrent) {
        onChange(unset())
        return
      }
      onChange(set({ _type: "slug", current: nextCurrent }))
    },
    [onChange]
  )

  // Auto-fill when the label changes, unless the admin has taken over.
  useEffect(() => {
    if (manuallyEditedRef.current) return
    if (!label) return

    const nextSlug = slugify(label)

    if (nextSlug !== current) {
      applySlug(nextSlug)
    }
  }, [label, current, applySlug])

  const handleManualChange = (e: ChangeEvent<HTMLInputElement>) => {
    manuallyEditedRef.current = true
    applySlug(slugify(e.currentTarget.value))
  }

  const handleUnlock = () => {
    manuallyEditedRef.current = true
    setUnlocked(true)
  }

  const isLocked = Boolean(current) && !unlocked

  return (
    <Stack space={2}>
      <Flex gap={2} align="center">
        <TextInput
          value={current}
          onChange={handleManualChange}
          readOnly={readOnly || isLocked}
          placeholder={label ? slugify(label) : "Fill in the label first"}
          style={{ flex: 1 }}
        />
        {isLocked && !readOnly && (
          <Button
            mode="ghost"
            icon={EditIcon}
            text="Edit"
            onClick={handleUnlock}
            title="Unlock the slug for manual editing. Changing an in-use slug strands events tagged with the old value."
          />
        )}
      </Flex>

      {isLocked && (
        <Card padding={2} radius={2} tone="transparent">
          <Flex align="center" gap={2}>
            <Text size={1} muted>
              <LockIcon />
            </Text>
            <Text size={1} muted>
              Auto-filled from the label. Click Edit to change manually.
            </Text>
          </Flex>
        </Card>
      )}

      {unlocked && (
        <Card padding={2} radius={2} tone="caution">
          <Text size={1}>
            Heads up: changing the slug will un-tag any events currently using
            the old value. They'll need to be re-tagged via the Customize Events
            tool.
          </Text>
        </Card>
      )}
    </Stack>
  )
}
