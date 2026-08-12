/** Geographic constants for the Hampton Roads region. */

/**
 * Center of Hampton Roads.
 * Used as the map's default center and as the geocoder's proximity bias point.
 */
export const REGION_CENTER: [number, number] = [-76.3, 36.95]

/** Default zoom for the resources map. Fits Hampton Roads without panning. */
export const REGION_DEFAULT_ZOOM = 10

/**
 * Bounding box covering Hampton Roads, coastal VA, and NE NC.
 *
 * Generous enough to include legitimate local resources;
 * tight enough to reject Mapbox best-effort matches that landed elsewhere (e.g. Winston-Salem at lng -80.24, DC at lat 38.9).
 */
export const REGION_BOUNDS = {
  minLat: 36.0,
  maxLat: 38.0,
  minLng: -78.0,
  maxLng: -75.0,
} as const

export const isInRegion = (coords: { lat: number; lng: number }): boolean =>
  coords.lat >= REGION_BOUNDS.minLat &&
  coords.lat <= REGION_BOUNDS.maxLat &&
  coords.lng >= REGION_BOUNDS.minLng &&
  coords.lng <= REGION_BOUNDS.maxLng
