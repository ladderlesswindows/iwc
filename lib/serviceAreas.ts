// Re-exports from location.ts — import from here across the codebase.
// To change service areas / cameras for a new location, edit lib/location.ts.

export type { CoverageAlert, ServiceArea } from "./serviceAreaTypes";

export {
  BUSINESS_NAME,
  LOCATION_CITY,
  CLOCK_TOWER_ZIP_KEY,
  CLOCK_TOWER_COORDS as CLOCK_TOWER_95060,
  CLOCK_TOWER_CAMERA,
  INITIAL_CAMERA,
  ZOOMED_CAMERA,
  DEFAULT_ZIP,
  SERVICE_AREAS,
} from "./location";

import { SERVICE_AREAS } from "./location";

// Detect which service ZIP (if any) a user-typed string matches
export function detectZip(input: string): string | null {
  const found = Object.keys(SERVICE_AREAS).find((z) => input.includes(z));
  return found ?? null;
}
