/** Build a Google Maps "search" URL for the given address. */
export const buildGoogleMapsUrl = (address: string): string => {
  // The address may contain " · " separator (used in display);
  // Google Maps wants commas instead.
  const query = address.replace(/ · /g, ", ")
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
