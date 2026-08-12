import { defineQuery } from "groq"

export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0] {
  siteTitle,
  siteShortName,
  logo,
  logoTagline,
  "navLinks": mainNav[]{
    _key,
    "title": @->title,
    "slug": select(
      @->_type == "eventsPage" => "events",
      @->_type == "chapterPrioritiesPage" => "chapter-priorities",
      @->_type == "resourcesPage" => "resources",
      @->_type == "getInvolvedPage" => "get-involved",
      @->_type == "aboutPage" => "about",
      @->slug.current
    )
  },
  callToActionText,
  callToActionLink,
  showRibbon,
  ribbonText,
  nextMeetingLabel,
  nextMeetingMatch,
  nextMeetingTextOverride,
  nextMeetingLinkOverride,
  bannerWords,
  signupLink,
  signupEyebrow,
  signupHeadline,
  signupDescription,
  socialLinks,
  socialIconStyle,
  contactEmail,
  contactEmailSubject,
  footerTagline,
  footerNoteLeft,
  footerNoteRight,
  footerColumns[]{
    _key,
    title,
    links[]{ _key, label, href }
  }
}`)
