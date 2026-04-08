import { v4 as uuidv4 } from "uuid";
import { Problem, ParamSchemaItem } from "../types";

function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export function generate(rng: () => number, params: any = {}): Problem {
  const minNumerator = params.minNumerator ?? 1;
  const maxNumerator = params.maxNumerator ?? 10;
  const minDenominator = params.minDenominator ?? 2;
  const maxDenominator = params.maxDenominator ?? 10;
  const operation = params.operation ?? "+";
  const useLikeDenominators = params.useLikeDenominators ?? false;
  const useMixedFractions = params.useMixedFractions ?? false;
  const nonNegative = params.nonNegative ?? true;

  let n1, d1, n2, d2, w1, w2, impN1, impN2, ansN, ansD;
  let found = false;
  let attempts = 0;

  while (!found && attempts < 50) {
    attempts++;
    n1 = randInt(rng, minNumerator, maxNumerator);
    d1 = randInt(rng, minDenominator, maxDenominator);
    n2 = randInt(rng, minNumerator, maxNumerator);
    d2 = randInt(rng, minDenominator, maxDenominator);

    if (useLikeDenominators) {
      d2 = d1;
    }

    w1 = 0; w2 = 0;
    if (useMixedFractions) {
      w1 = randInt(rng, 1, 3);
      w2 = randInt(rng, 1, 3);
    }

    impN1 = w1 * d1 + n1;
    impN2 = w2 * d2 + n2;

    switch (operation) {
      case "+":
        ansN = impN1 * d2 + impN2 * d1;
        ansD = d1 * d2;
        if (d1 === d2) { ansN = impN1 + impN2; ansD = d1; }
        break;
      case "-":
        ansN = impN1 * d2 - impN2 * d1;
        ansD = d1 * d2;
        if (d1 === d2) { ansN = impN1 - impN2; ansD = d1; }
        break;
      case "×":
        ansN = impN1 * impN2;
        ansD = d1 * d2;
        break;
      case "÷":
        ansN = impN1 * d2;
        ansD = d1 * impN2;
        break;
      default:
        ansN = impN1;
        ansD = d1;
    }

    if ((!nonNegative || ansN >= 0) && n1 !== d1 && n2 !== d2) {
      found = true;
    }
  }

  let steps: any = { type: operation };

  switch (operation) {
    case "+":
      if (d1 === d2) {
        steps.common = { n1: impN1, d1, n2: impN2, d2, resN: ansN, resD: ansD };
      } else {
        steps.common = { 
          n1: impN1 * d2, 
          d1: ansD, 
          n2: impN2 * d1, 
          d2: ansD, 
          resN: ansN, 
          resD: ansD,
          original: { n1: impN1, d1, n2: impN2, d2 }
        };
      }
      break;
    case "-":
      if (d1 === d2) {
        steps.common = { n1: impN1, d1, n2: impN2, d2, resN: ansN, resD: ansD };
      } else {
        steps.common = { 
          n1: impN1 * d2, 
          d1: ansD, 
          n2: impN2 * d1, 
          d2: ansD, 
          resN: ansN, 
          resD: ansD,
          original: { n1: impN1, d1, n2: impN2, d2 }
        };
      }
      break;
    case "×":
      steps.multiply = { n1: impN1, d1, n2: impN2, d2, resN: ansN, resD: ansD };
      break;
    case "÷":
      steps.inverse = { n1: impN1, d1, n2: d2, d2: impN2, resN: ansN, resD: ansD };
      break;
  }

  // Simplify answer
  const common = Math.abs(gcd(ansN, ansD));
  const simplifiedN = ansN / common;
  const simplifiedD = ansD / common;

  if (common > 1 && ansN !== 0) {
    steps.reduce = { n: ansN, d: ansD, factor: common, resN: simplifiedN, resD: simplifiedD };
  }

  // Mixed number result - only if enabled
  if (useMixedFractions && simplifiedN >= simplifiedD && simplifiedD !== 0) {
    const whole = Math.floor(simplifiedN / simplifiedD);
    const remN = simplifiedN % simplifiedD;
    if (remN > 0) {
      steps.mixed = { whole, n: remN, d: simplifiedD };
    } else {
      steps.mixed = { whole };
    }
  }

  let displayAnswer = `${simplifiedN}/${simplifiedD}`;
  if (simplifiedD === 1) displayAnswer = `${simplifiedN}`;
  if (simplifiedN === 0) displayAnswer = "0";

  return {
    id: uuidv4(),
    type: "fraction",
    question: {
      format: "fraction",
      data: { n1, d1, n2, d2, w1, w2, operation, steps },
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
  minDenominator: 2,
  maxDenominator: 5,
  operation: "+",
  useLikeDenominators: false,
  nonNegative: true,
};

export const paramSchema: ParamSchemaItem[] = [
  {
    name: "operation",
    label: "Operation",
    help: "Choose the mathematical operation for fraction problems.",
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
    name: "nonNegative",
    label: "No Negatives",
    help: "Ensures subtraction results are never less than zero.",
    type: "boolean",
    default: true,
    fullWidth: true,
  },
  {
    name: "useMixedFractions",
    label: "Mixed Fractions",
    help: "If enabled, problems will include whole numbers (e.g., 1 1/2).",
    type: "boolean",
    default: false,
    fullWidth: true,
  },
  {
    name: "useLikeDenominators",
    label: "Use Like Denominators",
    help: "If enabled, both fractions will have the same denominator (easier for add/sub).",
    type: "boolean",
    default: defaultParams.useLikeDenominators,
    fullWidth: true,
  },
  {
    name: "minNumerator",
    label: "Min Numerator",
    help: "The minimum value for the top number (numerator) of the fractions.",
    type: "number",
    default: defaultParams.minNumerator,
  },
  {
    name: "maxNumerator",
    label: "Max Numerator",
    help: "The maximum value for the top number (numerator) of the fractions.",
    type: "number",
    default: defaultParams.maxNumerator,
  },
  {
    name: "minDenominator",
    label: "Min Denominator",
    help: "The minimum value for the bottom number (denominator) of the fractions.",
    type: "number",
    default: defaultParams.minDenominator,
  },
  {
    name: "maxDenominator",
    label: "Max Denominator",
    help: "The maximum value for the bottom number (denominator) of the fractions.",
    type: "number",
    default: defaultParams.maxDenominator,
  },
];
