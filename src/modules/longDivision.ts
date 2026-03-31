import { v4 as uuidv4 } from "uuid";
import { Problem, ParamSchemaItem } from "../types";

function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function generate(rng: () => number, params: any = {}): Problem {
  let minDividend = params.minDividend ?? 1;
  let maxDividend = params.maxDividend ?? 20;
  let minDivisor = params.minDivisor ?? 1;
  let maxDivisor = params.maxDivisor ?? 10;
  const allowRemainder = params.allowRemainder ?? true;
  const disallowOne = params.disallowOne ?? true;

  // Validation: if min >= max, set max = min + 1
  if (minDividend >= maxDividend) maxDividend = minDividend + 1;
  if (minDivisor >= maxDivisor) maxDivisor = minDivisor + 1;

  let dividend: number;
  let divisor: number;

  if (!allowRemainder) {
    // We need dividend = divisor * quotient
    // Try to find a valid pair
    let attempts = 0;
    let found = false;
    divisor = randInt(rng, minDivisor, maxDivisor);
    let quotient = 1;

    while (attempts < 50 && !found) {
      divisor = randInt(rng, minDivisor, maxDivisor);
      const minQ = (disallowOne) ? 2 : 1;
      const maxQ = Math.floor(maxDividend / divisor);
      
      const actualMinQ = Math.max(minQ, Math.ceil(minDividend / divisor));
      
      if (actualMinQ <= maxQ) {
        quotient = randInt(rng, actualMinQ, maxQ);
        found = true;
      }
      attempts++;
    }
    
    if (!found) {
      // Fallback: ignore disallowOne if we really can't find anything
      divisor = randInt(rng, minDivisor, maxDivisor);
      const actualMinQ = Math.ceil(minDividend / divisor);
      const maxQ = Math.floor(maxDividend / divisor);
      if (actualMinQ <= maxQ) {
        quotient = randInt(rng, actualMinQ, maxQ);
      } else {
        // Absolute fallback
        divisor = minDivisor;
        dividend = minDividend;
        quotient = Math.floor(dividend / divisor);
      }
    }
    dividend = divisor * quotient;
  } else {
    dividend = randInt(rng, minDividend, maxDividend);
    divisor = randInt(rng, minDivisor, maxDivisor);
  }

  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;

  return {
    id: uuidv4(),
    type: "longDivision",
    question: {
      format: "longDivision",
      data: {
        dividend,
        divisor,
      },
    },
    answer: {
      value: { quotient, remainder },
      display: remainder > 0 ? `${quotient} R ${remainder}` : `${quotient}`,
    },
  };
}

export const defaultParams = {
  minDividend: 1,
  maxDividend: 20,
  minDivisor: 1,
  maxDivisor: 10,
  allowRemainder: true,
  disallowOne: true,
};

export const paramSchema: ParamSchemaItem[] = [
  {
    name: "allowRemainder",
    label: "Allow Remainders",
    help: "If enabled, division problems can have remainders. If disabled, problems will always divide evenly.",
    type: "boolean",
    default: defaultParams.allowRemainder,
  },
  {
    name: "disallowOne",
    label: "No Quotient 1",
    help: "Prevents problems where the answer is 1 (e.g., 5 ÷ 5). Only applies when remainders are disabled.",
    type: "boolean",
    default: defaultParams.disallowOne,
  },
  {
    name: "minDividend",
    label: "Min Dividend",
    help: "The minimum value for the number being divided (the number inside the bracket).",
    type: "number",
    default: defaultParams.minDividend,
  },
  {
    name: "maxDividend",
    label: "Max Dividend",
    help: "The maximum value for the number being divided (the number inside the bracket).",
    type: "number",
    default: defaultParams.maxDividend,
  },
  {
    name: "minDivisor",
    label: "Min Divisor",
    help: "The minimum value for the number you are dividing by (the number outside the bracket).",
    type: "number",
    default: defaultParams.minDivisor,
  },
  {
    name: "maxDivisor",
    label: "Max Divisor",
    help: "The maximum value for the number you are dividing by (the number outside the bracket).",
    type: "number",
    default: defaultParams.maxDivisor,
  },
];
