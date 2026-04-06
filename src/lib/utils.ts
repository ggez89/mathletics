import { WorksheetConfig } from "../types";

/**
 * Encodes a WorksheetConfig object into a URL-safe Base64 string.
 * Optimized for QR code density by shortening keys and omitting defaults.
 */
export function encodeConfig(config: WorksheetConfig): string {
  try {
    // 1. Map to short keys and omit defaults
    const compact: any = {
      v: config.version,
      s: config.seed,
      c: config.count,
      ps: config.problemSets.map(ps => ({
        ty: ps.type,
        w: ps.weight === 1 ? undefined : ps.weight,
        p: ps.params
      })),
      l: {
        pr: config.layout.problemsPerRow === 2 ? undefined : config.layout.problemsPerRow,
        fs: config.layout.fontSize === 20 ? undefined : config.layout.fontSize,
        sp: config.layout.spacing === 22 ? undefined : config.layout.spacing,
        t: config.layout.title || undefined,
        sa: config.layout.showAnswers ? true : undefined,
        ss: config.layout.showSeed ? true : undefined,
        sc: config.layout.showConfigKey ? true : undefined,
        sq: config.layout.showQRCode ? undefined : false, // Default is true
        pm: config.layout.paginationMode === "pages" ? undefined : config.layout.paginationMode,
        pp: config.layout.problemsPerPage === 20 ? undefined : config.layout.problemsPerPage,
        pc: config.layout.pageCount === 1 ? undefined : config.layout.pageCount,
      }
    };

    // Clean up undefined values from layout
    Object.keys(compact.l).forEach(key => compact.l[key] === undefined && delete compact.l[key]);
    if (Object.keys(compact.l).length === 0) delete compact.l;
    
    // Clean up undefined weights from problemSets
    compact.ps.forEach((ps: any) => ps.w === undefined && delete ps.w);

    const json = JSON.stringify(compact);
    const utf8 = unescape(encodeURIComponent(json));
    const base64 = btoa(utf8);
    return base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  } catch (error) {
    console.error("Failed to encode config:", error);
    return "";
  }
}

/**
 * Decodes a URL-safe Base64 string back into a WorksheetConfig object.
 * Handles both legacy full-key JSON and optimized short-key JSON.
 */
export function decodeConfig(key: string): WorksheetConfig | null {
  try {
    // Restore standard Base64 characters
    let base64 = key.replace(/-/g, "+").replace(/_/g, "/");
    // Restore padding
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const utf8 = atob(base64);
    const json = decodeURIComponent(escape(utf8));
    const data = JSON.parse(json);

    // Handle legacy format (if 'version' exists as a full key)
    if (data.version) return data;

    // Handle optimized format
    const config: WorksheetConfig = {
      version: data.v || "1.0.0",
      seed: data.s || "",
      count: data.c ?? 20,
      problemSets: (data.ps || []).map((ps: any) => ({
        type: ps.ty,
        weight: ps.w ?? 1,
        params: ps.p || {}
      })),
      layout: {
        problemsPerRow: data.l?.pr ?? 2,
        fontSize: data.l?.fs ?? 20,
        spacing: data.l?.sp ?? 22,
        title: data.l?.t || "",
        showAnswers: !!data.l?.sa,
        showSeed: !!data.l?.ss,
        showConfigKey: !!data.l?.sc,
        showQRCode: data.l?.sq ?? true,
        paginationMode: data.l?.pm || "pages",
        problemsPerPage: data.l?.pp ?? 20,
        pageCount: data.l?.pc ?? 1,
      }
    };

    return config;
  } catch (error) {
    console.error("Failed to decode config:", error);
    return null;
  }
}

/**
 * Generates a random 6-character alphanumeric seed.
 */
export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Helper to get a random item from an array based on weights.
 */
export function weightedRandom<T>(items: T[], weights: number[], rng: () => number): T {
  return items[weightedRandomIndex(weights, rng)];
}

/**
 * Helper to get a random index from an array based on weights.
 */
export function weightedRandomIndex(weights: number[], rng: () => number): number {
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  let random = rng() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) {
      return i;
    }
    random -= weights[i];
  }
  return 0;
}

export function generateTitle(config: WorksheetConfig): string {
  if (!config.problemSets || config.problemSets.length === 0) return "Math Worksheet";
  const types = Array.from(new Set(config.problemSets.map((s) => s.type)));
  const typeLabels = types.map((t) => {
    if (t === "arithmetic") return "Arithmetic";
    if (t === "fraction") return "Fraction Operations";
    if (t === "longDivision") return "Division";
    if (t === "time") return "Time Telling";
    return t;
  });

  let title = typeLabels.join(" & ");
  if (config.problemSets.length === 1) {
    const set = config.problemSets[0];
    if (set.type === "arithmetic") {
      const op = set.params.operation;
      let opLabel = "Arithmetic";
      if (op === "+") opLabel = "Addition";
      else if (op === "-" || op === "−") opLabel = "Subtraction";
      else if (op === "*" || op === "×") opLabel = "Multiplication";
      else if (op === "/" || op === "÷") opLabel = "Division";
      
      title = `${opLabel} Practice`;
    } else if (set.type === "longDivision") {
      title = "Long Division";
    } else if (set.type === "time") {
      title = "Time Telling";
    } else if (set.type === "fraction") {
      const op = set.params.operation;
      const opLabel = op === "+" ? "Addition" : op === "-" ? "Subtraction" : op === "×" ? "Multiplication" : op === "÷" ? "Division" : "Operations";
      title = `Fraction ${opLabel}`;
    }
  }

  return `${title}`;
}

/**
 * Calculates the maximum number of problems that can fit on a page based on layout settings.
 */
export function calculateAutoProblemsPerPage(config: WorksheetConfig, showAnswers: boolean = false): number {
  // Heuristic: 11in page = 1056px. 
  // Subtract margins (64px), header (~160px), footer (~100px)
  const availableHeight = 1056 - 64 - 160 - 100;
  
  let maxProblemHeight = 0;
  
  config.problemSets.forEach(s => {
    const format = s.params?.format || (s.type === "fraction" ? "fraction" : s.type === "longDivision" ? "longDivision" : s.type === "time" ? "time" : "inline");
    let h = 0;
    switch (format) {
      case "longDivision":
        // Estimate height based on dividend length (each digit adds ~2 rows of steps)
        // We look for the first longDivision set to get a representative maxDividend
        const ldSet = config.problemSets.find(s => s.type === "longDivision");
        const maxDiv = ldSet?.params.maxDividend || 100;
        // Number of digits in dividend is floor(log10(maxDiv)) + 1
        const digits = Math.floor(Math.log10(maxDiv)) + 1;
        // Each digit can have a step (2 rows). Plus dividend/quotient rows.
        // We use 32px per row (2rem) for safety.
        h = showAnswers ? (digits * 2 + 2) * 32 : 120; 
        break;
      case "time":
        h = 190; // Reduced further to ensure 3 rows (6 clocks) fit on a page
        break;
      case "vertical":
        h = config.layout.fontSize * 3 + 40;
        break;
      case "fraction":
        h = Math.max(40, config.layout.fontSize * 2.5);
        break;
      case "inline":
      default:
        h = Math.max(32, config.layout.fontSize * 1.5);
        break;
    }
    maxProblemHeight = Math.max(maxProblemHeight, h);
  });

  // Add renderer padding (print:py-2 = 16px total) and spacing
  const estimatedProblemHeight = maxProblemHeight + config.layout.spacing + 16;
  const rows = Math.max(1, Math.floor(availableHeight / estimatedProblemHeight));
  const calculatedPerPage = rows * config.layout.problemsPerRow;
  
  return calculatedPerPage;
}
