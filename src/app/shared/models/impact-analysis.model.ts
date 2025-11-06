export interface ImpactAnalysisRequest {
  moduleId: number;
  changeDescription: string;
  changeType: string;
}

export interface AffectedModule {
  id: number;
  moduleName: string;
  riskScore: number;
  cascadeDepth: number;
}

export interface ImpactAnalysisResponse {
  analysisId: number;
  affectedModules: AffectedModule[];
  riskScore: number;
  riskLevel: string;
  cascadeDepth: number;
  recommendations: string[];
  testPlan: any;
  analysisDurationMs: number;
}

export enum ChangeType {
  BUG_FIX = 'BUG_FIX',
  FEATURE_ENHANCEMENT = 'FEATURE_ENHANCEMENT',
  REFACTORING = 'REFACTORING',
  DATA_MODEL_CHANGE = 'DATA_MODEL_CHANGE'
}
