import { useCallback, useMemo } from "react"
import { Button, Flex, Stack } from "@sanity/ui"
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
      <Flex align="center">
        <Button
          mode="bleed"
          icon={ArrowLeftIcon}
          text="Back to Customize Events"
          fontSize={1}
          padding={2}
          onClick={goBack}
        />
      </Flex>

      {/* Studio renders the default form below the header */}
      {props.renderDefault(props)}
    </Stack>
  )
}
