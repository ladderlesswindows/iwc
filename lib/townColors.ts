const TOWN_COLORS: Record<string, string> = {
  "Santa Cruz":    "#0ea5e9",
  "Felton":        "#22c55e",
  "Ben Lomond":    "#84cc16",
  "Scotts Valley": "#f59e0b",
  "Boulder Creek": "#4ade80",
  "Aptos":         "#34d399",
  "Capitola":      "#fbbf24",
  "Soquel":        "#e879f9",
  "Watsonville":   "#f43f5e",
  "Los Gatos":     "#a78bfa",
  "Saratoga":      "#ec4899",
  "Campbell":      "#f97316",
  "San Jose":      "#06b6d4",
  "Los Altos":     "#818cf8",
  "Sunnyvale":     "#fb923c",
  "Mountain View": "#2dd4bf",
  "Cupertino":     "#c084fc",
  "Santa Clara":   "#38bdf8",
  "Palo Alto":     "#a3e635",
  "Monterey":      "#e2e8f0",
};

const OVERFLOW_PALETTE = ["#60a5fa","#f472b6","#4ade80","#fb923c","#e879f9","#2dd4bf","#818cf8","#fbbf24"];

export function getTownColor(town: string): string {
  if (TOWN_COLORS[town]) return TOWN_COLORS[town];
  let hash = 0;
  for (const c of town) hash = ((hash << 5) - hash) + c.charCodeAt(0);
  return OVERFLOW_PALETTE[Math.abs(hash) % OVERFLOW_PALETTE.length];
}

export function extractTown(address: string | null | undefined): string | null {
  if (!address) return null;
  const parts = address.split(",").map(s => s.trim());
  for (let i = 0; i < parts.length; i++) {
    if (/^CA(\s+\d{5})?$/.test(parts[i]) || /^\d{5}$/.test(parts[i])) {
      return i > 0 ? parts[i - 1] : null;
    }
  }
  return parts.length >= 2 ? parts[parts.length - 2] : null;
}
