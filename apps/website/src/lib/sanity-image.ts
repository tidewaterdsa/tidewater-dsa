import { sanityClient } from "sanity:client"
import { createImageUrlBuilder } from "@sanity/image-url"

const builder = createImageUrlBuilder(sanityClient)

type SanityImageSource = Parameters<typeof builder.image>[number]

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}
