const UEN_SOURCE = String.raw`(?:\d{8,9}[A-Za-z]|[STRstr]\d{2}[A-Za-z]{2}\d{4}[A-Za-z])`;
const UEN_EXACT = /^(?:\d{8,9}[A-Z]|[STR]\d{2}[A-Z]{2}\d{4}[A-Z])$/;

function uenFinder(): RegExp {
  return new RegExp(String.raw`\b${UEN_SOURCE}\b`, "gi");
}

function yearFinder(): RegExp {
  return /\b(?:FY\s*)?(20(?:1[8-9]|2[0-6]))\b/gi;
}

const HANDOFF_RULES: { reason: string; pattern: RegExp }[] = [
  { reason: "Asked for a person", pattern: /\bhuman\b/i },
  { reason: "Refund request", pattern: /\brefunds?\b/i },
  { reason: "Complaint", pattern: /\bcomplaints?\b|\bcomplain\b/i },
  { reason: "Asked for a manager", pattern: /\bmanager\b/i },
  { reason: "Legal concern", pattern: /\blawyer\b|\bsue\b|\bscam\b/i },
  { reason: "Asked for a person", pattern: /\breal person\b|\bspeak to (?:someone|a person|leon)\b/i },
];

export type Extraction = {
  companyName: string | null;
  uen: string | null;
  years: string[];
  greetingOnly: boolean;
  serviceEnquiry: boolean;
  handoffReason: string | null;
  donePhrase: boolean;
  speed: "standard" | "rush" | null;
  confirm: "yes" | "change_years" | "change_speed" | null;
  wantsLink: boolean;
  restart: boolean;
  paidClaim: boolean;
  statusAsk: boolean;
  thanks: boolean;
};

export function emptyExtraction(): Extraction {
  return {
    companyName: null,
    uen: null,
    years: [],
    greetingOnly: false,
    serviceEnquiry: false,
    handoffReason: null,
    donePhrase: false,
    speed: null,
    confirm: null,
    wantsLink: false,
    restart: false,
    paidClaim: false,
    statusAsk: false,
    thanks: false,
  };
}

export function cleanUen(value: string | null | undefined): string | null {
  if (!value) return null;
  const compact = value.replace(/\s+/g, "").toUpperCase();
  return UEN_EXACT.test(compact) ? compact : null;
}

export function cleanCompanyName(value: string | null | undefined): string | null {
  if (!value) return null;
  const name = value
    .replace(uenFinder(), " ")
    .replace(/\bFY\s*20(?:1[8-9]|2[0-6])\b/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/(?:\s*,?\s*\band\b\s*)+$/i, "")
    .replace(/^[,:.\-]+|[,:.\-]+$/g, "")
    .trim();
  if (name.length < 2 || name.length > 120) return null;
  if (/^(hi|hello|hey|yes|no|done|ok|okay|thanks|thank you)$/i.test(name)) return null;
  return name;
}

export function cleanYears(values: string[] | null | undefined): string[] {
  if (!values) return [];
  const years = new Set<string>();
  for (const value of values) {
    const match = /^(?:FY\s*)?(20(?:1[8-9]|2[0-6]))$/i.exec(value.trim());
    if (match) years.add(`FY${match[1]}`);
  }
  return [...years].sort((left, right) => left.localeCompare(right));
}

export function extractMessage(text: string): Extraction {
  const trimmed = text.trim();
  const uenMatch = trimmed.match(uenFinder());
  const uen = cleanUen(uenMatch?.[0] ?? null);
  const years = findYears(trimmed);
  const handoffReason = detectHandoff(trimmed);
  const greetingOnly = /^(hi|hello|hey|good morning|good afternoon|good evening|hi there|hello there)[!.\s]*$/i.test(trimmed);
  const donePhrase = /^(done|all done|that'?s all|thats all|that is all|all sent|finished|no more|no more years)[!.\s]*$/i.test(trimmed);
  const thanks = /^(thanks|thank you|ty|noted)[!.\s]*$/i.test(trimmed);
  const restart = /^(start over|start again|restart)[!.\s]*$/i.test(trimmed);
  const wantsLink = /^(link|payment link|pay|send link|resend|resend link)[!.\s]*$/i.test(trimmed);
  const companyName =
    greetingOnly || donePhrase || thanks || restart || wantsLink ? null : companyFromText(trimmed);
  const rush = /\b(rush|24[- ]?hours?|express)\b/i.test(trimmed);
  const standard = /\b(standard|normal|3 working days|three working days|no rush)\b/i.test(trimmed);
  let speed: Extraction["speed"] = null;
  if (rush && !standard) speed = "rush";
  else if (standard && !rush) speed = "standard";

  let confirm: Extraction["confirm"] = null;
  if (/^(yes|y|ok|okay|confirm|proceed|go ahead|send link|send the link)[!.\s]*$/i.test(trimmed)) {
    confirm = "yes";
  } else if (/\b(change years|wrong years|another year)\b/i.test(trimmed)) {
    confirm = "change_years";
  } else if (/\b(change speed|not rush|make it rush|switch to standard)\b/i.test(trimmed)) {
    confirm = "change_speed";
  }

  return {
    companyName,
    uen,
    years,
    greetingOnly,
    serviceEnquiry: /\b(annual return|agm|overdue|bizfile|acra|help)\b/i.test(trimmed),
    handoffReason,
    donePhrase,
    speed,
    confirm,
    wantsLink,
    restart,
    paidClaim: /\b(i (?:have )?paid|payment (?:is )?done|already paid)\b/i.test(trimmed),
    statusAsk: /^(status|any update\??|update\??|how long|when will it be ready\??|is it ready\??)[!.\s]*$/i.test(trimmed),
    thanks,
  };
}

export function mergeExtraction(base: Extraction, extra: Pick<Extraction, "companyName" | "uen" | "years"> | null): Extraction {
  if (!extra) return base;
  const years = cleanYears([...base.years, ...extra.years]);
  return {
    ...base,
    companyName: base.companyName ?? cleanCompanyName(extra.companyName),
    uen: base.uen ?? cleanUen(extra.uen),
    years,
  };
}

export function validateLlmPayload(value: unknown): Pick<Extraction, "companyName" | "uen" | "years"> | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const companyName = typeof record.companyName === "string" ? cleanCompanyName(record.companyName) : null;
  const uen = typeof record.uen === "string" ? cleanUen(record.uen) : null;
  const years = Array.isArray(record.years) ? cleanYears(record.years.filter((item) => typeof item === "string")) : [];
  if (!companyName && !uen && years.length === 0) return null;
  return { companyName, uen, years };
}

function detectHandoff(text: string): string | null {
  const looksLikeEntity = /\b(pte|ltd|llp|limited)\b/i.test(text);
  for (const rule of HANDOFF_RULES) {
    if (!rule.pattern.test(text)) continue;
    if (looksLikeEntity && rule.reason === "Asked for a person" && /\bhuman\b/i.test(text) && !/\b(refund|complain|lawyer|scam)\b/i.test(text)) {
      continue;
    }
    return rule.reason;
  }
  return null;
}

function companyFromText(text: string): string | null {
  const labeled = text.match(/\b(?:company|business)(?:\s+name)?\s*(?:is|:)\s*(.+)$/i);
  if (labeled?.[1]) {
    const cleaned = cleanCompanyName(labeled[1].split(/[.\n]/)[0] ?? null);
    if (cleaned) return cleaned;
  }
  if (/\b(pte|ltd|llp|limited|partnership)\b/i.test(text)) {
    const sentence = text.split(/[.\n]/).find((part) => /\b(pte|ltd|llp|limited|partnership)\b/i.test(part));
    const cleaned = cleanCompanyName(sentence ?? text);
    if (cleaned) return cleaned;
  }
  if (looksLikeBareName(text)) return cleanCompanyName(text);
  return null;
}

function looksLikeBareName(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 2 || trimmed.length > 80) return false;
  if (/[?]/.test(trimmed)) return false;
  if (trimmed.split(/\s+/).length > 6) return false;
  if (/^(i|we|my|please|can|could|how|what|why|when|need|help)\b/i.test(trimmed)) return false;
  if (/\b(help|overdue|annual|return|payment|refund|year|years)\b/i.test(trimmed)) return false;
  if (/^(yes|no|ok|okay|thanks|thank you|done|rush|standard)$/i.test(trimmed)) return false;
  return true;
}

function findYears(text: string): string[] {
  const stripped = text.replace(uenFinder(), " ");
  const years = new Set<string>();
  for (const match of stripped.matchAll(yearFinder())) {
    if (match[1]) years.add(`FY${match[1]}`);
  }
  return [...years].sort((left, right) => left.localeCompare(right));
}
