import { SELECTABLE_YEARS } from "@/config/whatsapp-templates";

const YEAR_ID = /^year_(FY20(?:1[8-9]|2[0-6]))$/;

export function sortYears(years: string[]): string[] {
  return [...new Set(years)].sort((left, right) => left.localeCompare(right));
}

export function yearFromId(id: string): string | null {
  const match = YEAR_ID.exec(id);
  return match?.[1] ?? null;
}

export function yearRows(selected: string[]): { id: string; title: string; description: string }[] {
  const rows: { id: string; title: string; description: string }[] = SELECTABLE_YEARS.filter((year) => !selected.includes(year)).map((year) => ({
    id: `year_${year}`,
    title: year,
    description: "Add this year",
  }));
  if (selected.length > 0) {
    rows.push({
      id: "years_done",
      title: "That's all",
      description: "Continue to turnaround",
    });
    rows.push({
      id: "years_clear",
      title: "Clear years",
      description: "Start the year list again",
    });
  }
  return rows;
}
