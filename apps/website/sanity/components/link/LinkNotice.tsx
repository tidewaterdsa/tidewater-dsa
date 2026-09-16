import type { ReactNode } from "react"
import { Button, Card, Flex, Stack, Text } from "@sanity/ui"
import { InfoOutlineIcon, UndoIcon, WarningOutlineIcon } from "@sanity/icons"
import type { HrefAnalysis } from "./linkHref"

/** Inline so a path or URL sits in the sentence instead of breaking it apart. */
const Mono = ({ children }: { children: ReactNode }) => (
  <code style={{ fontSize: "0.9em", overflowWrap: "anywhere" }}>
    {children}
  </code>
)

const Notice = ({
  tone,
  children,
}: {
  tone: "caution" | "primary"
  children: ReactNode
}) => (
  <Card padding={3} radius={2} tone={tone} border>
    <Flex align="flex-start" gap={3}>
      <Text size={1}>
        {tone === "caution" ? <WarningOutlineIcon /> : <InfoOutlineIcon />}
      </Text>
      <Stack space={3} flex={1}>
        {children}
      </Stack>
    </Flex>
  </Card>
)

const ExternalOnlyNotice = () => (
  <Notice tone="caution">
    <Text size={1}>
      This field needs the full address of another website, starting with{" "}
      <Mono>https://</Mono>.
    </Text>
  </Notice>
)

interface HrefNoticeProps {
  analysis: HrefAnalysis
  externalOnly: boolean
  onApply: (next: string) => void
}

/** Shown after a scheme was added for the admin, so they can put it back. */
export const AutoFixNotice = ({ onUndo }: { onUndo: () => void }) => (
  <Notice tone="primary">
    <Text size={1}>
      That looked like another website, so <Mono>https://</Mono> was added for
      you. Without it, the link would have pointed at a page on this site.
    </Text>
    <Flex>
      <Button
        mode="ghost"
        icon={UndoIcon}
        text="Undo"
        fontSize={1}
        onClick={onUndo}
      />
    </Flex>
  </Notice>
)

/** What the admin is told about a link we can't quietly fix ourselves. */
export const HrefNotice = ({
  analysis,
  externalOnly,
  onApply,
}: HrefNoticeProps) => {
  if (analysis.kind === "ok") return null

  if (analysis.kind === "needs-scheme") {
    // Only reachable before the field is blurred, or after an undo.
    const isEmail = analysis.suggestion.startsWith("mailto:")

    return (
      <Notice tone="caution">
        <Text size={1}>
          {isEmail ? (
            <>
              An email address needs <Mono>mailto:</Mono> in front, otherwise
              this is treated as a page on this site.
            </>
          ) : (
            <>
              This is missing <Mono>https://</Mono>, so it will be treated as a
              page on this site and send visitors to the 404 page.
            </>
          )}
        </Text>
        <Flex>
          <Button
            mode="ghost"
            text={isEmail ? "Add mailto:" : "Add https://"}
            fontSize={1}
            onClick={() => onApply(analysis.suggestion)}
          />
        </Flex>
      </Notice>
    )
  }

  // Everything below is some flavour of internal path, which these fields never want.
  if (externalOnly) return <ExternalOnlyNotice />

  if (analysis.kind === "internal") return null

  if (analysis.kind === "unknown-internal") {
    return (
      <Notice tone="caution">
        <Text size={1}>
          No page on this site lives at <Mono>{analysis.path}</Mono> yet.
          Double-check the path, or add <Mono>https://</Mono> if it belongs to
          another website.
        </Text>
      </Notice>
    )
  }

  if (analysis.kind === "missing-slash") {
    return (
      <Notice tone="caution">
        <Text size={1}>
          Did you mean <Mono>{analysis.suggestion}</Mono>? Links to pages on
          this site start with a slash.
        </Text>
        <Flex>
          <Button
            mode="ghost"
            text={`Use ${analysis.suggestion}`}
            fontSize={1}
            onClick={() => onApply(analysis.suggestion)}
          />
        </Flex>
      </Notice>
    )
  }

  const { asExternal, asInternal } = analysis

  return (
    <Notice tone="caution">
      <Text size={1}>
        There's no <Mono>https://</Mono> here, so this will be treated as a page
        on this site. If it points to another website it needs{" "}
        <Mono>https://</Mono> in front; if it's a page here, start it with a
        slash.
      </Text>
      <Flex gap={2}>
        {asExternal && (
          <Button
            mode="ghost"
            text={`Use ${asExternal}`}
            fontSize={1}
            onClick={() => onApply(asExternal)}
          />
        )}
        <Button
          mode="ghost"
          text={`Use ${asInternal}`}
          fontSize={1}
          onClick={() => onApply(asInternal)}
        />
      </Flex>
    </Notice>
  )
}
