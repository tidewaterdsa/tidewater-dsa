import { useCallback } from "react"
import { Flex, Stack, Text } from "@sanity/ui"
import { ArrowLeftIcon } from "@sanity/icons"
import { useRouter } from "sanity/router"
import type { InputProps } from "sanity"

export const EventFormHeader = (props: InputProps) => {
  const router = useRouter()

  const goBack = useCallback(() => {
    router.navigateUrl({ path: "/customize" })
  }, [router])

  return (
    <Stack space={4}>
      <Flex align="center" gap={2}>
        <a
          onClick={(e) => {
            e.preventDefault()
            goBack()
          }}
          href="/admin/customize"
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
