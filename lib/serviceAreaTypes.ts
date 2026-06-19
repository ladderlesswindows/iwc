export interface CoverageAlert {
  headline: string;
  notes: string[];
}

export interface ServiceArea {
  zip: string;
  name: string;
  center: [number, number];
  minWindows: number;
  alert?: CoverageAlert;
}
