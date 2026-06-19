export interface AnalysisResult {
  sql: string;
  explanation: string[];
  insights: string[];
  visualization: {
    chartType: "bar" | "line" | "pie" | "area";
    title: string;
    labelKey: string;
    valueKey: string;
    data: Array<Record<string, string | number>>;
  };
  assumptions: string[];
}

export interface SampleQuestion {
  question: string;
  description: string;
}

export interface SchemaPreset {
  id: string;
  name: string;
  description: string;
  dbType: string;
  schema: string;
  sampleQuestions: SampleQuestion[];
}

export interface SavedAnalysis {
  id: string;
  timestamp: string;
  dbType: string;
  question: string;
  schema: string;
  result: AnalysisResult;
}
