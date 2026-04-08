import { v4 as uuidv4 } from "uuid";
import { Problem, ParamSchemaItem } from "../types";

function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function hasCarryover(a: number, b: number, operation: string): boolean {
  const sA = Math.abs(a).toString();
  const sB = Math.abs(b).toString();
  const maxLen = Math.max(sA.length, sB.length);
  
  const padA = sA.padStart(maxLen, '0');
  const padB = sB.padStart(maxLen, '0');
  
  // We check from right to left (ones, tens, etc.)
  for (let i = 0; i < maxLen; i++) {
    const digitA = parseInt(padA[maxLen - 1 - i]);
    const digitB = parseInt(padB[maxLen - 1 - i]);
    
    if (operation === "+") {
      if (digitA + digitB >= 10) return true;
    } else {
      if (digitA < digitB) return true;
    }
  }
  return false;
}

function calculateStackedSteps(a: number, b: number, operation: string) {
  const sA = a.toString();
  const sB = b.toString();
  const maxLen = Math.max(sA.length, sB.length);
  const padA = sA.padStart(maxLen, '0');
  const padB = sB.padStart(maxLen, '0');
  
  if (operation === "+" || operation === "Addition") {
    const carries: number[] = [];
    let carry = 0;
    for (let i = 0; i < maxLen; i++) {
      const digitA = parseInt(padA[maxLen - 1 - i]);
      const digitB = parseInt(padB[maxLen - 1 - i]);
      const sum = digitA + digitB + carry;
      carry = sum >= 10 ? 1 : 0;
      carries.unshift(carry);
    }
    // Remove the last carry if it's 0 (it's for the next column which might not exist)
    // Actually, we want carries[i] to be the carry ABOVE column i.
    // Column 0 is ones, Column 1 is tens, etc.
    // Carry from ones goes to tens.
    const resultCarries = new Array(maxLen).fill(0);
    let c = 0;
    for (let i = 0; i < maxLen; i++) {
      const digitA = parseInt(padA[maxLen - 1 - i]);
      const digitB = parseInt(padB[maxLen - 1 - i]);
      const sum = digitA + digitB + c;
      c = sum >= 10 ? 1 : 0;
      if (i + 1 < maxLen) {
        resultCarries[maxLen - 2 - i] = c;
      }
    }
    return { carries: resultCarries };
  } else if (operation === "-" || operation === "−" || operation === "Subtraction") {
    // Borrowing
    const borrows: any[] = []; // { index, original, current, isBorrowed }
    const digitsA = padA.split('').map(Number);
    const digitsB = padB.split('').map(Number);
    const steps = digitsA.map(d => ({ original: d, current: d, isBorrowed: false, borrowedFrom: false }));

    for (let i = maxLen - 1; i >= 0; i--) {
      if (steps[i].current < digitsB[i]) {
        // Need to borrow
        let j = i - 1;
        while (j >= 0 && steps[j].current === 0) {
          j--;
        }
        
        if (j >= 0) {
          // Borrow from j
          steps[j].current -= 1;
          steps[j].borrowedFrom = true;
          // Fill zeros in between
          for (let k = j + 1; k < i; k++) {
            steps[k].current = 9;
            steps[k].isBorrowed = true;
            steps[k].borrowedFrom = true;
          }
          steps[i].current += 10;
          steps[i].isBorrowed = true;
        }
      }
    }
    return { borrows: steps };
  } else if (operation === "×" || operation === "Multiplication") {
    const sB = b.toString();
    const partialProducts: { value: number; color: string; offset: number }[] = [];
    const stepColors = ["#dc2626", "#2563eb", "#16a34a", "#9333ea", "#ea580c"];

    if (sB.length > 1) {
      for (let i = 0; i < sB.length; i++) {
        const digit = parseInt(sB[sB.length - 1 - i]);
        const partialValue = a * digit * Math.pow(10, i);
        partialProducts.push({
          value: partialValue,
          color: stepColors[i % stepColors.length],
          offset: i
        });
      }
    }
    return { partialProducts };
  }
  return null;
}

export function generate(rng: () => number, params: any = {}): Problem {
  const minVal = Number(params.minVal ?? 1);
  const maxVal = Number(params.maxVal ?? 100);
  const maxAnswer = Number(params.maxAnswer ?? 1000);
  const operation = params.operation ?? "+";
  const format = params.format ?? "inline";

  let a = 0;
  let b = 0;
  let result = 0;
  let displayResult = "";

  const maxAttempts = 200;
  let attempts = 0;
  let found = false;

  while (attempts < maxAttempts && !found) {
    attempts++;
    
    let nextA = 0;
    let nextB = 0;
    let nextResult = 0;
    let respectsStructural = true;

    if (operation === "+") {
      // a + b <= maxAnswer
      // Also a >= minVal, b >= minVal
      // So a <= maxAnswer - minVal
      const effMaxA = Math.min(maxVal, maxAnswer - minVal);
      if (effMaxA < minVal) {
        // Impossible to satisfy minVal and maxAnswer
        nextA = minVal;
        nextB = minVal;
      } else {
        nextA = randInt(rng, minVal, effMaxA);
        const effMaxB = Math.min(maxVal, maxAnswer - nextA);
        if (effMaxB < minVal) {
          nextB = minVal;
        } else {
          nextB = randInt(rng, minVal, effMaxB);
        }
      }
      nextResult = nextA + nextB;
      if (params.disallowCarryover && hasCarryover(nextA, nextB, "+")) respectsStructural = false;
    } else if (operation === "-" || operation === "−") {
      // abs(a - b) <= maxAnswer
      nextA = randInt(rng, minVal, maxVal);
      
      // We need |nextA - nextB| <= maxAnswer
      // -maxAnswer <= nextA - nextB <= maxAnswer
      // nextB >= nextA - maxAnswer
      // nextB <= nextA + maxAnswer
      let minB = Math.max(minVal, nextA - maxAnswer);
      let maxB = Math.min(maxVal, nextA + maxAnswer);
      
      if (params.nonNegative) {
        // nextA - nextB >= 0 => nextB <= nextA
        maxB = Math.min(maxB, nextA);
      }
      
      if (minB > maxB) {
        nextB = nextA; // Fallback to 0 difference
      } else {
        nextB = randInt(rng, minB, maxB);
      }
      
      nextResult = nextA - nextB;
      if (params.disallowCarryover && hasCarryover(nextA, nextB, "-")) respectsStructural = false;
    } else if (operation === "×") {
      // a * b <= maxAnswer
      const effMaxA = Math.min(maxVal, Math.floor(maxAnswer / Math.max(1, minVal)));
      if (effMaxA < minVal) {
        nextA = minVal;
        nextB = minVal;
      } else {
        nextA = randInt(rng, minVal, effMaxA);
        const effMaxB = Math.min(maxVal, Math.floor(maxAnswer / Math.max(1, nextA)));
        if (effMaxB < minVal) {
          nextB = minVal;
        } else {
          nextB = randInt(rng, minVal, effMaxB);
        }
      }
      nextResult = nextA * nextB;
    } else if (operation === "÷") {
      // a / b <= maxAnswer
      nextB = randInt(rng, Math.max(1, minVal), maxVal);
      const disallowOne = params.disallowOne ?? true;
      
      if (params.allowRemainder) {
        const effMaxA = Math.min(maxVal, nextB * maxAnswer + (nextB - 1));
        if (effMaxA < minVal) {
          nextA = minVal;
        } else {
          nextA = randInt(rng, Math.max(minVal, nextB), effMaxA);
        }
        nextResult = Math.floor(nextA / nextB);
        if (disallowOne && nextResult === 1) respectsStructural = false;
      } else {
        const maxK = Math.min(maxAnswer, Math.floor(maxVal / nextB));
        const minK = Math.max(1, Math.ceil(minVal / nextB));
        if (minK > maxK) {
           nextB = Math.max(1, minVal);
           nextA = nextB;
           nextResult = 1;
        } else {
           const k = randInt(rng, minK, maxK);
           nextA = nextB * k;
           nextResult = k;
        }
        if (disallowOne && nextResult === 1) respectsStructural = false;
      }
    }

    if (respectsStructural && Math.abs(nextResult) <= maxAnswer) {
      a = nextA;
      b = nextB;
      result = nextResult;
      found = true;
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
      data: { 
        a, 
        b, 
        operation: displayOp,
        steps: format === "stacked" ? calculateStackedSteps(a, b, operation) : null
      },
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
  disallowCarryover: false,
};

export const paramSchema: ParamSchemaItem[] = [
  {
    name: "operation",
    label: "Operation",
    help: "Choose the mathematical operation for this problem set.",
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
    label: "Max Answer",
    help: "The maximum allowed absolute value for the answer (e.g., if set to 20, answers will be between -20 and 20).",
    type: "number",
    default: defaultParams.maxAnswer,
  },
  {
    name: "minVal",
    label: "Min Value",
    help: "The minimum value for any single number in the problem.",
    type: "number",
    default: defaultParams.minVal,
  },
  {
    name: "maxVal",
    label: "Max Value",
    help: "The maximum value for any single number in the problem.",
    type: "number",
    default: defaultParams.maxVal,
  },
  {
    name: "format",
    label: "Format",
    help: "Choose how the problem is displayed on the worksheet.",
    type: "select",
    default: defaultParams.format,
    options: [
      { label: "Inline (a + b = )", value: "inline" },
      { label: "Stacked", value: "stacked" },
    ],
  },
  {
    name: "nonNegative",
    label: "No Negatives",
    help: "Ensures subtraction results are never less than zero.",
    type: "boolean",
    default: defaultParams.nonNegative,
  },
  {
    name: "allowRemainder",
    label: "Allow Remainders",
    help: "If enabled, division problems can have remainders (e.g., 7 ÷ 2 = 3 R 1).",
    type: "boolean",
    default: defaultParams.allowRemainder,
  },
  {
    name: "disallowOne",
    label: "No Quotient 1",
    help: "Prevents simple division problems where the answer is 1 (e.g., 5 ÷ 5).",
    type: "boolean",
    default: defaultParams.disallowOne,
  },
  {
    name: "disallowCarryover",
    label: "No Carryover",
    help: "Ensures addition/subtraction doesn't require carrying or borrowing digits.",
    type: "boolean",
    default: defaultParams.disallowCarryover,
  },
];
