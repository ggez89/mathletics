import { v4 as uuidv4 } from "uuid";
import { Problem, ParamSchemaItem } from "../types";

function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function generate(rng: () => number, params: any = {}): Problem {
  const minVal = params.minVal ?? 1;
  const maxVal = params.maxVal ?? 100;
  const maxAnswer = params.maxAnswer ?? 1000;
  const operation = params.operation ?? "+";
  const format = params.format ?? "inline";

  let a = 0;
  let b = 0;
  let result = 0;
  let displayResult = "";

  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    a = randInt(rng, minVal, maxVal);
    b = randInt(rng, minVal, maxVal);

    if (operation === "+") {
      result = a + b;
    } else if (operation === "-" || operation === "−") {
      result = a - b;
      if (params.nonNegative && result < 0) continue;
    } else if (operation === "×") {
      result = a * b;
    } else if (operation === "÷") {
      if (b === 0) continue;
      const disallowOne = params.disallowOne ?? true;
      if (params.allowRemainder) {
        if (disallowOne && Math.floor(a / b) === 1) continue;
        result = Math.floor(a / b);
      } else {
        if (a % b !== 0) continue;
        result = a / b;
        if (disallowOne && result === 1) continue;
      }
    }

    if (Math.abs(result) <= maxAnswer) {
      break;
    }
  }

  if (operation === "÷" && params.allowRemainder) {
    const quotient = Math.floor(a / b);
    const remainder = a % b;
    displayResult = remainder > 0 ? `${formatNumber(quotient)} R ${formatNumber(remainder)}` : `${formatNumber(quotient)}`;
  } else {
    displayResult = formatNumber(result);
  }

  const displayOp = operation === "-" ? "−" : operation;

  return {
    id: uuidv4(),
    type: "arithmetic",
    question: {
      format: format as any,
      data: { a, b, operation: displayOp },
    },
    answer: {
      value: result,
      display: displayResult,
    },
  };
}

function formatNumber(n: number): string {
  return n.toString().replace("-", "−");
}

export const defaultParams = {
  minVal: 1,
  maxVal: 10,
  maxAnswer: 20,
  operation: "+",
  format: "inline",
  nonNegative: true,
  allowRemainder: false,
  disallowOne: true,
};

export const paramSchema: ParamSchemaItem[] = [
  {
    name: "operation",
    label: "Operation",
    type: "select",
    default: defaultParams.operation,
    options: [
      { label: "Addition (+)", value: "+" },
      { label: "Subtraction (−)", value: "−" },
      { label: "Multiplication (×)", value: "×" },
      { label: "Division (÷)", value: "÷" },
    ],
  },
  {
    name: "maxAnswer",
    label: "Max Answer (absolute)",
    type: "number",
    default: defaultParams.maxAnswer,
  },
  {
    name: "minVal",
    label: "Min Value",
    type: "number",
    default: defaultParams.minVal,
  },
  {
    name: "maxVal",
    label: "Max Value",
    type: "number",
    default: defaultParams.maxVal,
  },
  {
    name: "format",
    label: "Format",
    type: "select",
    default: defaultParams.format,
    options: [
      { label: "Inline (a + b = )", value: "inline" },
      { label: "Vertical", value: "vertical" },
    ],
  },
  {
    name: "nonNegative",
    label: "Non-negative results only",
    type: "boolean",
    default: defaultParams.nonNegative,
  },
  {
    name: "allowRemainder",
    label: "Allow remainders (Division)",
    type: "boolean",
    default: defaultParams.allowRemainder,
  },
  {
    name: "disallowOne",
    label: "Disallow Quotient 1 (Division)",
    type: "boolean",
    default: defaultParams.disallowOne,
  },
];
