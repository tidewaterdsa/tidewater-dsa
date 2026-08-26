import { useCallback, useMemo } from "react"
import { Flex, Stack, Text } from "@sanity/ui"
import { ArrowLeftIcon } from "@sanity/icons"
import { useWorkspace } from "sanity"
import { useRouter } from "sanity/router"
import type { InputProps } from "sanity"
import { CUSTOMIZE_TOOL_NAME } from "../tools/customize-events/constants"

export const EventFormHeader = (props: InputProps) => {
  const router = useRouter()
  const { basePath } = useWorkspace()

  // navigateUrl takes a browser path, so basePath has to be included
  // without it this hits the site's own /customize and Studio reports "Workspace not found".
  const customizeToolPath = useMemo(
    () => `${basePath === "/" ? "" : basePath}/${CUSTOMIZE_TOOL_NAME}`,
    [basePath]
  )

  const goBack = useCallback(() => {
    router.navigateUrl({ path: customizeToolPath })
  }, [customizeToolPath, router])

  return (
    <Stack space={4}>
      <Flex align="center" gap={2}>
        <a
          onClick={(e) => {
            e.preventDefault()
            goBack()
          }}
          href={customizeToolPath}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--card-link-color, #2276fc)",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = "underline"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = "none"
          }}
        >
          <ArrowLeftIcon />
          <Text size={1} style={{ color: "inherit", fontWeight: 500 }}>
            Back to Customize Events
          </Text>
        </a>
      </Flex>

      {/* Studio renders the default form below the header */}
      {props.renderDefault(props)}
    </Stack>
  )
}
