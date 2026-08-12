import { defineQuery } from "groq"

export const HOME_PAGE_QUERY = defineQuery(`
  *[_type == "homePage" && _id == "homePage"][0] {
    heroHeadline,
    heroSubheadline,
    heroImage,
    heroCtaText,
    heroCtaLink,
    heroCta2Text,
    heroCta2Link,
    heroCtaPosition,
    contentEyebrow,
    contentHeadline,
    body,
    bodyImage,
    eventsEyebrow,
    eventsHeadline,
    eventsImage,
    noEventsHeadline,
    noEventsBody,
    noRsvpMessage,
  }
`)