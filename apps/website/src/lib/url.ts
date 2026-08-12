/**
 * Checks if a given URL string is an external link, email, or phone number.
 */
export const isExternalHref = (href: string | null | undefined): boolean => {
  if (!href) return false
  return /^(https?:|mailto:|tel:)/i.test(href)
}
