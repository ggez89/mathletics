import { v4 as uuidv4 } from "uuid";
import { Problem, ParamSchemaItem } from "../types";

function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function generate(rng: () => number, params: any = {}): Problem {
  const minNumerator = params.minNumerator ?? 1;
  const maxNumerator = params.maxNumerator ?? 10;
  const minDenominator = params.minDenominator ?? 2;
  const maxDenominator = params.maxDenominator ?? 10;
  const operation = params.operation ?? "+";

  const n1 = randInt(rng, minNumerator, maxNumerator);
  const d1 = randInt(rng, minDenominator, maxDenominator);
  const n2 = randInt(rng, minNumerator, maxNumerator);
  const d2 = randInt(rng, minDenominator, maxDenominator);

  let ansN: number, ansD: number;

  switch (operation) {
    case "+":
      if (d1 === d2) {
        ansN = n1 + n2;
        ansD = d1;
      } else {
        ansN = n1 * d2 + n2 * d1;
        ansD = d1 * d2;
      }
      break;
    case "-":
      if (d1 === d2) {
        ansN = n1 - n2;
        ansD = d1;
      } else {
        ansN = n1 * d2 - n2 * d1;
        ansD = d1 * d2;
      }
      break;
    case "×":
      ansN = n1 * n2;
      ansD = d1 * d2;
      break;
    case "÷":
      ansN = n1 * d2;
      ansD = d1 * n2;
      break;
    default:
      ansN = n1;
      ansD = d1;
  }

  // Simplify answer
  const common = Math.abs(gcd(ansN, ansD));
  const simplifiedN = ansN / common;
  const simplifiedD = ansD / common;

  let displayAnswer = `${simplifiedN}/${simplifiedD}`;
  if (simplifiedD === 1) displayAnswer = `${simplifiedN}`;
  if (simplifiedN === 0) displayAnswer = "0";

  // Add unreduced form if different
  if (common > 1) {
    displayAnswer += ` (${ansN}/${ansD})`;
  }

  return {
    id: uuidv4(),
    type: "fraction",
    question: {
      format: "fraction",
      data: { n1, d1, n2, d2, operation },
    },
    answer: {
      value: ansN / ansD,
      display: displayAnswer,
    },
  };
}

export const defaultParams = {
  minNumerator: 1,
  maxNumerator: 5,
  minDenominator: 1,
  maxDenominator: 5,
  operation: "+",
};

export const paramSchema: ParamSchemaItem[] = [
  {
    name: "operation",
    label: "Operation",
    type: "select",
    default: defaultParams.operation,
    fullWidth: true,
    options: [
      { label: "Addition (+)", value: "+" },
      { label: "Subtraction (-)", value: "-" },
      { label: "Multiplication (×)", value: "×" },
      { label: "Division (÷)", value: "÷" },
    ],
  },
  {
    name: "minNumerator",
    label: "Min Numerator",
    type: "number",
    default: defaultParams.minNumerator,
  },
  {
    name: "maxNumerator",
    label: "Max Numerator",
    type: "number",
    default: defaultParams.maxNumerator,
  },
  {
    name: "minDenominator",
    label: "Min Denominator",
    type: "number",
    default: defaultParams.minDenominator,
  },
  {
    name: "maxDenominator",
    label: "Max Denominator",
    type: "number",
    default: defaultParams.maxDenominator,
  },
];
