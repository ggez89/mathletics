import { WorksheetConfig } from "../types";

/**
 * Encodes a WorksheetConfig object into a URL-safe Base64 string.
 * JSON → UTF-8 → Base64 → URL-safe transform
 */
export function encodeConfig(config: WorksheetConfig): string {
  try {
    const json = JSON.stringify(config);
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
    return JSON.parse(json);
  } catch (error) {
    console.error("Failed to decode config:", error);
    return null;
  }
}

/**
 * Generates a random 8-character alphanumeric seed.
 */
export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

/**
 * Helper to get a random item from an array based on weights.
 */
export function weightedRandom<T>(items: T[], weights: number[], rng: () => number): T {
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  let random = rng() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]) {
      return items[i];
    }
    random -= weights[i];
  }
  return items[0];
}

export function generateTitle(config: WorksheetConfig): string {
  if (!config.problemSets || config.problemSets.length === 0) return "Math Worksheet";
  const types = Array.from(new Set(config.problemSets.map((s) => s.type)));
  const typeLabels = types.map((t) => {
    if (t === "arithmetic") return "Arithmetic";
    if (t === "fraction") return "Fractions";
    if (t === "longDivision") return "Division";
    return t;
  });

  let title = typeLabels.join(" & ");
  if (config.problemSets.length === 1) {
    const set = config.problemSets[0];
    if (set.type === "arithmetic") {
      title = `${set.params.operation === "+" ? "Addition" : set.params.operation === "-" ? "Subtraction" : set.params.operation === "*" ? "Multiplication" : "Division"} Practice`;
    } else if (set.type === "longDivision") {
      title = "Long Division Practice";
    } else if (set.type === "fraction") {
      title = "Fraction Operations";
    }
  }

  return `${title}`;
}
