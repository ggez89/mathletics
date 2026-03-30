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

  let a: number;
  let b: number;

  switch (operation) {
    case "+":
      a = randInt(rng, minVal, Math.min(maxVal, Math.max(minVal, maxAnswer - minVal)));
      b = randInt(rng, minVal, Math.min(maxVal, Math.max(minVal, maxAnswer - a)));
      break;
    case "-":
      // a - b = result. We want a <= maxVal, b <= maxVal, result <= maxAnswer.
      a = randInt(rng, minVal, maxVal);
      // result <= maxAnswer => a - b <= maxAnswer => b >= a - maxAnswer
      const minB_sub = Math.max(minVal, a - maxAnswer);
      const maxB_sub = params.nonNegative ? a : maxVal;
      if (minB_sub <= maxB_sub) {
        b = randInt(rng, minB_sub, maxB_sub);
      } else {
        a = randInt(rng, minVal, Math.min(maxVal, maxAnswer + minVal));
        b = randInt(rng, minVal, a);
      }
      break;
    case "×":
      a = randInt(rng, minVal, Math.min(maxVal, Math.max(minVal, Math.floor(maxAnswer / minVal))));
      b = randInt(rng, minVal, Math.min(maxVal, Math.max(minVal, Math.floor(maxAnswer / a))));
      break;
    case "÷":
      const disallowOne = params.disallowOne ?? true;
      if (params.allowRemainder) {
        // a / b. We want a <= maxVal, b <= maxVal, quotient <= maxAnswer.
        b = randInt(rng, minVal, maxVal);
        // a / b < maxAnswer + 1 => a < (maxAnswer + 1) * b
        const effectiveMaxA = Math.min(maxVal, (maxAnswer + 1) * b - 1);
        // If disallowOne is true, we want quotient >= 2, so a >= 2 * b
        const effectiveMinA = Math.max(minVal, disallowOne ? 2 * b : b); 
        
        if (effectiveMinA <= effectiveMaxA) {
          a = randInt(rng, effectiveMinA, effectiveMaxA);
        } else {
          // Fallback: if we can't satisfy disallowOne, try without it
          const fallbackMinA = Math.max(minVal, b);
          if (fallbackMinA <= effectiveMaxA) {
            a = randInt(rng, fallbackMinA, effectiveMaxA);
          } else {
            a = b; // Absolute fallback
          }
        }
      } else {
        // a / b = quotient. We want a <= maxVal, b <= maxVal, quotient <= maxAnswer.
        // a = quotient * b.
        // Pick b first
        b = randInt(rng, minVal, maxVal);
        // quotient * b <= maxVal => quotient <= maxVal / b
        const maxQ = Math.min(maxAnswer, Math.floor(maxVal / b));
        // quotient * b >= minVal => quotient >= minVal / b
        const minQ = Math.max(disallowOne ? 2 : 1, Math.ceil(minVal / b));
        
        if (minQ <= maxQ) {
          const quotient = randInt(rng, minQ, maxQ);
          a = quotient * b;
        } else {
          // Fallback: try to find any valid b
          let found = false;
          for (let testB = minVal; testB <= maxVal; testB++) {
            const tMaxQ = Math.min(maxAnswer, Math.floor(maxVal / testB));
            const tMinQ = Math.max(disallowOne ? 2 : 1, Math.ceil(minVal / testB));
            if (tMinQ <= tMaxQ) {
              b = testB;
              const quotient = randInt(rng, tMinQ, tMaxQ);
              a = quotient * testB;
              found = true;
              break;
            }
          }
          if (!found) {
            // If still not found and disallowOne was true, try with quotient 1
            if (disallowOne) {
              for (let testB = minVal; testB <= maxVal; testB++) {
                const tMaxQ = Math.min(maxAnswer, Math.floor(maxVal / testB));
                const tMinQ = Math.max(1, Math.ceil(minVal / testB));
                if (tMinQ <= tMaxQ) {
                  b = testB;
                  const quotient = randInt(rng, tMinQ, tMaxQ);
                  a = quotient * testB;
                  found = true;
                  break;
                }
              }
            }
          }
          if (!found) {
            b = minVal;
            a = minVal;
          }
        }
      }
      break;
    default:
      a = randInt(rng, minVal, maxVal);
      b = randInt(rng, minVal, maxVal);
  }

  let result: number;
  let displayResult: string;

  switch (operation) {
    case "+":
      result = a + b;
      displayResult = `${result}`;
      break;
    case "-":
      result = a - b;
      displayResult = `${result}`;
      break;
    case "×":
      result = a * b;
      displayResult = `${result}`;
      break;
    case "÷":
      if (params.allowRemainder) {
        const quotient = Math.floor(a / b);
        const remainder = a % b;
        result = quotient; // value is just quotient for internal use maybe? 
        displayResult = remainder > 0 ? `${quotient} R ${remainder}` : `${quotient}`;
      } else {
        result = a / b;
        displayResult = `${result}`;
      }
      break;
    default:
      result = a + b;
      displayResult = `${result}`;
  }

  return {
    id: uuidv4(),
    type: "arithmetic",
    question: {
      format: format as any,
      data: { a, b, operation },
    },
    answer: {
      value: result,
      display: displayResult,
    },
  };
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
      { label: "Subtraction (-)", value: "-" },
      { label: "Multiplication (×)", value: "×" },
      { label: "Division (÷)", value: "÷" },
    ],
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
    name: "maxAnswer",
    label: "Max Answer",
    type: "number",
    default: defaultParams.maxAnswer,
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
