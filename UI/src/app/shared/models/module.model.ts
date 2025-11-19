export interface Module {
  id?: number;
  moduleName: string;
  description?: string;
  techStack?: string;
  owner?: any;
  criticalityLevel: CriticalityLevel;
  version?: string;
  repositoryUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CriticalityLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}
