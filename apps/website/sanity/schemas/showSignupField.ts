import { defineField } from "sanity"

interface ShowSignupFieldOptions {
  initialValue: boolean
  group?: string
}

export const defineShowSignupField = ({
  initialValue,
  group,
}: ShowSignupFieldOptions) => {
  return defineField({
    name: "showSignup",
    title: "Show Signup Section",
    type: "boolean",
    ...(group ? { group } : {}),
    description:
      "When on, the newsletter signup band appears at the bottom of this page (above the footer). The form itself is configured in Site Settings.",
    initialValue,
  })
}
