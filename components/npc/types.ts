// Shared types and step definitions for all NPC skins

export type Step = "location" | "timeslot" | "windows" | "estimate" | "contact" | "complete";
export type Skin = "game" | "clean" | "power";
export type ThemeMode = "dark" | "light";

export const STEP_ORDER: Step[] = [
  "location",
  "timeslot",
  "windows",
  "estimate",
  "contact",
  "complete",
];

export interface QuestItem {
  step: Step;
  label: string;
  value: string;
  confirmed: boolean;
}

// Props every skin receives from the orchestrator
export interface SkinProps {
  // Quest progress
  step: Step;
  goToStep: (s: Step) => void;
  questItems: QuestItem[];

  // Booking state
  date: string;
  time: string;
  windowCount: number;
  needsEstimate: boolean;
  estimateDeadline: string;
  slotMap: Record<string, string[]>;

  // Booking setters (NPC can push values into the main form)
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
  onWindowCountChange: (n: number) => void;
  onNeedsEstimateChange: (v: boolean) => void;
  onEstimateDeadlineChange: (d: string) => void;

  // Pause (used by GameSkin only; CleanSkin ignores it)
  paused: boolean;
  onResume: () => void;

  // Navigation
  onGoToSummary: () => void;

  // Current zip from map/page — synced down so skins show the dot-selected area
  selectedZip?: string;

  // Called when the user enters a different ZIP — bubbles up to page.tsx → MapPanel
  onZipChange?: (zip: string) => void;

  // Called when user fills in a street address — bubbles to page.tsx → MapPanel geocode
  address?: string;
  onAddressChange?: (v: string) => void;

  // Optional contact fields (GameSkin contact step; PowerConsoleSkin uses its own interface)
  firstName?: string;
  phone?: string;
  email?: string;
  onFirstNameChange?: (v: string) => void;
  onPhoneChange?: (v: string) => void;
  onEmailChange?: (v: string) => void;

  // Theme — light/dark
  mode: ThemeMode;

  // Skin switching (from within a skin, e.g. "Full Form" button)
  onSkinChange?: (skin: Skin) => void;
}
