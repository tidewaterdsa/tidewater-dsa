import type {
  EVENT_CUSTOMIZATIONS_QUERY_RESULT,
  Page,
  SITE_SETTINGS_QUERY_RESULT,
} from "@/sanity/types"

// Helper that forces TypeScript to evaluate the intersection into a flat object
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Settings = NonNullable<SITE_SETTINGS_QUERY_RESULT>

export type IconVariant = NonNullable<Settings["socialIconStyle"]>

export type ValidNavLink = Prettify<
  NonNullable<Settings["navLinks"]>[number] & {
    title: string
    slug: string
  }
>

// Portable text block shapes

type BodyElement = NonNullable<Page["body"]>[number]

export type SanityImageBlock = Extract<BodyElement, { _type: "image" }>

export type ImageDisplaySize = NonNullable<SanityImageBlock["displaySize"]>

export type SanityTextBlock = Extract<BodyElement, { _type: "block" }>

type MarkDef = NonNullable<SanityTextBlock["markDefs"]>[number]

export type SanityLinkMarkDef = Extract<MarkDef, { _type: "link" }>

export type EventCustomization =
  NonNullable<EVENT_CUSTOMIZATIONS_QUERY_RESULT>[number]
