export type ProblemFormat = "inline" | "vertical" | "fraction" | "longDivision" | "time";

export interface ProblemData {
  [key: string]: any;
}

export interface Problem {
  id: string;
  type: string;
  question: {
    format: ProblemFormat;
    data: ProblemData;
  };
  answer: {
    value: any;
    display: string;
  };
}

export interface ProblemModule {
  generate: (rng: () => number, params: any) => Problem;
  defaultParams: any;
  paramSchema: ParamSchemaItem[];
}

export interface ParamSchemaItem {
  name: string;
  label: string;
  help?: string;
  type: "number" | "text" | "select" | "boolean";
  default: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  fullWidth?: boolean;
}

export interface ProblemDefinition {
  type: string;
  weight: number;
  params: any;
}

export interface LayoutSettings {
  problemsPerRow: number;
  fontSize: number;
  spacing: number;
  title: string;
  showAnswers: boolean;
  showSeed: boolean;
  showConfigKey: boolean;
  showQRCode: boolean;
  paginationMode: "count" | "pages";
  problemsPerPage: number;
  pageCount: number;
}

export interface WorksheetConfig {
  version: string;
  seed: string;
  layout: LayoutSettings;
  problemSets: ProblemDefinition[];
  count: number;
}
