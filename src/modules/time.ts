import { v4 as uuidv4 } from "uuid";
import { Problem, ParamSchemaItem } from "../types";

function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

const SCENARIOS = [
  { text: "I wake up at...", defaultTime: { h: 7, m: 0 } },
  { text: "I start school at...", defaultTime: { h: 8, m: 30 } },
  { text: "I eat lunch at...", defaultTime: { h: 12, m: 0 } },
  { text: "I finish school at...", defaultTime: { h: 15, m: 30 } },
  { text: "I eat dinner at...", defaultTime: { h: 18, m: 30 } },
  { text: "I go to bed at...", defaultTime: { h: 20, m: 0 } },
];

export function generate(rng: () => number, params: any = {}): Problem {
  const mode = params.mode ?? "identify";
  const precision = params.precision ?? "hour";
  const useScenarios = params.useScenarios ?? false;
  const numberStyle = params.numberStyle ?? "all";
  const showTicks = params.showTicks ?? true;

  let h = randInt(rng, 1, 12);
  let m = 0;

  switch (precision) {
    case "hour":
      m = 0;
      break;
    case "half-hour":
      m = randInt(rng, 0, 1) * 30;
      break;
    case "quarter":
      m = randInt(rng, 0, 3) * 15;
      break;
    case "five-minute":
      m = randInt(rng, 0, 11) * 5;
      break;
    case "minute":
    default:
      m = randInt(rng, 0, 59);
      break;
  }

  let scenarioText = "";
  if (mode === "draw" && useScenarios && rng() > 0.5) {
    const scenario = SCENARIOS[randInt(rng, 0, SCENARIOS.length - 1)];
    scenarioText = scenario.text;
    h = scenario.defaultTime.h > 12 ? scenario.defaultTime.h - 12 : scenario.defaultTime.h;
    m = scenario.defaultTime.m;
  }

  const displayTime = `${h}:${m.toString().padStart(2, "0")}`;
  
  // For "Quarter to Eleven" type text, we can add a helper if needed, 
  // but for now simple h:mm is fine for the answer engine.
  
  return {
    id: uuidv4(),
    type: "time",
    question: {
      format: "time",
      data: { 
        h, 
        m, 
        mode, 
        scenarioText, 
        numberStyle, 
        showTicks 
      },
    },
    answer: {
      value: { h, m },
      display: displayTime,
    },
  };
}

export const defaultParams = {
  mode: "identify",
  precision: "hour",
  useScenarios: false,
  numberStyle: "all",
  showTicks: true,
};

export const paramSchema: ParamSchemaItem[] = [
  {
    name: "mode",
    label: "Mode",
    help: "Choose whether to identify the time on a clock or draw the hands for a given time.",
    type: "select",
    default: defaultParams.mode,
    options: [
      { label: "Identify (Read Clock)", value: "identify" },
      { label: "Draw (Set Hands)", value: "draw" },
    ],
  },
  {
    name: "precision",
    label: "Precision",
    help: "Set the precision of the time intervals (e.g., every 5 minutes or every minute).",
    type: "select",
    default: defaultParams.precision,
    options: [
      { label: "On the Hour", value: "hour" },
      { label: "Half Hour", value: "half-hour" },
      { label: "Quarter Hour", value: "quarter" },
      { label: "5 Minute Intervals", value: "five-minute" },
      { label: "1 Minute Intervals", value: "minute" },
    ],
  },
  {
    name: "useScenarios",
    label: "Use Scenarios",
    help: "If enabled, problems will include real-world scenarios like 'I wake up at...'.",
    type: "boolean",
    default: defaultParams.useScenarios,
  },
  {
    name: "numberStyle",
    label: "Numbers on Face",
    help: "Choose which numbers are displayed on the clock face.",
    type: "select",
    default: defaultParams.numberStyle,
    options: [
      { label: "All (1-12)", value: "all" },
      { label: "Major (12, 3, 6, 9)", value: "major" },
      { label: "None", value: "none" },
    ],
  },
  {
    name: "showTicks",
    label: "Show Minute Ticks",
    help: "Toggle the display of small minute markers around the clock face.",
    type: "boolean",
    default: defaultParams.showTicks,
  },
];
