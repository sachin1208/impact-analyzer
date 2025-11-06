import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface MockUser {
  id: number;
  username: string;
  email: string;
  roles: string[];
  token: string;
}

export interface MockModule {
  id: number;
  moduleName: string;
  description: string;
  techStack: string;
  criticalityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  version: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  // Mock user database
  private mockUsers: MockUser[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      roles: ['ROLE_ADMIN'],
      token: 'mock_jwt_token_admin_12345'
    },
    {
      id: 2,
      username: 'developer',
      email: 'developer@example.com',
      roles: ['ROLE_DEVELOPER'],
      token: 'mock_jwt_token_developer_67890'
    },
    {
      id: 3,
      username: 'viewer',
      email: 'viewer@example.com',
      roles: ['ROLE_VIEWER'],
      token: 'mock_jwt_token_viewer_11111'
    }
  ];

  // Mock modules database
  private mockModules: MockModule[] = [
    {
      id: 1,
      moduleName: 'User Authentication',
      description: 'Handles user login and session management',
      techStack: 'Spring Security',
      criticalityLevel: 'CRITICAL',
      version: '1.0.0',
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      moduleName: 'User Profile',
      description: 'Manages user profile information',
      techStack: 'Spring Boot',
      criticalityLevel: 'HIGH',
      version: '1.0.0',
      createdAt: new Date('2024-01-15')
    },
    {
      id: 3,
      moduleName: 'Dashboard',
      description: 'Main application dashboard',
      techStack: 'Angular',
      criticalityLevel: 'HIGH',
      version: '1.0.0',
      createdAt: new Date('2024-01-16')
    },
    {
      id: 4,
      moduleName: 'Reporting Engine',
      description: 'Generates reports and analytics',
      techStack: 'Java',
      criticalityLevel: 'MEDIUM',
      version: '1.0.0',
      createdAt: new Date('2024-01-17')
    },
    {
      id: 5,
      moduleName: 'Data Processing',
      description: 'Processes application data',
      techStack: 'Spring Batch',
      criticalityLevel: 'CRITICAL',
      version: '1.0.0',
      createdAt: new Date('2024-01-18')
    },
    {
      id: 6,
      moduleName: 'Notification Service',
      description: 'Sends notifications to users',
      techStack: 'Spring Mail',
      criticalityLevel: 'MEDIUM',
      version: '1.0.0',
      createdAt: new Date('2024-01-19')
    },
    {
      id: 7,
      moduleName: 'File Storage',
      description: 'Manages file uploads and storage',
      techStack: 'AWS S3',
      criticalityLevel: 'LOW',
      version: '1.0.0',
      createdAt: new Date('2024-01-20')
    },
    {
      id: 8,
      moduleName: 'Payment Gateway',
      description: 'Handles payment processing',
      techStack: 'Stripe Integration',
      criticalityLevel: 'CRITICAL',
      version: '1.0.0',
      createdAt: new Date('2024-01-21')
    },
    {
      id: 9,
      moduleName: 'Analytics Module',
      description: 'Analytics and tracking functionality',
      techStack: 'Google Analytics',
      criticalityLevel: 'MEDIUM',
      version: '1.0.0',
      createdAt: new Date('2024-01-22')
    },
    {
      id: 10,
      moduleName: 'Search Service',
      description: 'Full-text search functionality',
      techStack: 'Elasticsearch',
      criticalityLevel: 'HIGH',
      version: '1.0.0',
      createdAt: new Date('2024-01-23')
    }
  ];

  // Mock dependencies
  private mockDependencies = [
    { source_module_id: 1, target_module_id: 2, dependency_type: 'DIRECT', criticality_score: 85 },
    { source_module_id: 1, target_module_id: 3, dependency_type: 'DIRECT', criticality_score: 90 },
    { source_module_id: 3, target_module_id: 4, dependency_type: 'DIRECT', criticality_score: 70 },
    { source_module_id: 5, target_module_id: 6, dependency_type: 'DIRECT', criticality_score: 75 },
    { source_module_id: 3, target_module_id: 7, dependency_type: 'DIRECT', criticality_score: 60 },
    { source_module_id: 5, target_module_id: 8, dependency_type: 'DIRECT', criticality_score: 95 },
    { source_module_id: 3, target_module_id: 9, dependency_type: 'DIRECT', criticality_score: 65 },
    { source_module_id: 3, target_module_id: 10, dependency_type: 'DIRECT', criticality_score: 70 }
  ];

  // Mock analysis results
  private mockAnalyses = [
    {
      analysisId: 1,
      affectedModules: [
        { id: 2, moduleName: 'User Profile', riskScore: 75, cascadeDepth: 1 },
        { id: 3, moduleName: 'Dashboard', riskScore: 85, cascadeDepth: 2 },
        { id: 4, moduleName: 'Reporting Engine', riskScore: 60, cascadeDepth: 3 }
      ],
      riskScore: 73,
      riskLevel: 'HIGH',
      cascadeDepth: 3,
      recommendations: [
        'HIGH RISK: Thorough testing recommended',
        'Module "Dashboard" requires special attention (Risk: 85%)',
        'Execute all priority test cases'
      ],
      analysisDurationMs: 2450
    },
    {
      analysisId: 2,
      affectedModules: [
        { id: 6, moduleName: 'Notification Service', riskScore: 55, cascadeDepth: 1 }
      ],
      riskScore: 35,
      riskLevel: 'MEDIUM',
      cascadeDepth: 1,
      recommendations: [
        'MEDIUM RISK: Standard testing procedures apply',
        'Focus on affected modules for regression testing'
      ],
      analysisDurationMs: 1230
    }
  ];

  constructor() {}

  // Mock Login
  mockLogin(username: string, password: string): Observable<any> {
    const user = this.mockUsers.find(u => u.username === username);
    
    if (user && password === 'Admin@123') {
      return of({
        token: user.token,
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles
      }).pipe(delay(500)); // Simulate network delay
    }
    
    throw new Error('Invalid credentials');
  }

  // Mock Get All Modules
  mockGetModules(): Observable<MockModule[]> {
    return of(this.mockModules).pipe(delay(800));
  }

  // Mock Get Module by ID
  mockGetModule(id: number): Observable<MockModule | undefined> {
    return of(this.mockModules.find(m => m.id === id)).pipe(delay(300));
  }

  // Mock Get Dependencies
  mockGetDependencies(): Observable<any[]> {
    // Transform to frontend format
    const dependencies = this.mockDependencies.map(dep => {
      const source = this.mockModules.find(m => m.id === dep.source_module_id);
      const target = this.mockModules.find(m => m.id === dep.target_module_id);
      return {
        id: Math.random(),
        sourceModule: source,
        targetModule: target,
        dependencyType: dep.dependency_type,
        criticalityScore: dep.criticality_score
      };
    });
    return of(dependencies).pipe(delay(600));
  }

  // Mock Get Dependency Graph (for D3 visualization)
  mockGetDependencyGraph(): Observable<any> {
    const nodes = this.mockModules.map(m => ({
      id: m.id,
      name: m.moduleName,
      criticality: m.criticalityLevel,
      techStack: m.techStack
    }));

    const links = this.mockDependencies.map(dep => ({
      source: dep.source_module_id,
      target: dep.target_module_id,
      type: dep.dependency_type,
      criticality: dep.criticality_score
    }));

    return of({ nodes, links }).pipe(delay(700));
  }

  // Mock Impact Analysis
  mockAnalyzeImpact(request: any): Observable<any> {
    // Find the module being changed
    const module = this.mockModules.find(m => m.id === request.moduleId);
    
    if (!module) {
      throw new Error('Module not found');
    }

    // Find related dependencies
    const relatedDeps = this.mockDependencies.filter(
      d => d.source_module_id === module.id || d.target_module_id === module.id
    );

    // Build affected modules list
    const affectedModuleIds = new Set<number>();
    relatedDeps.forEach(dep => {
      affectedModuleIds.add(dep.source_module_id);
      affectedModuleIds.add(dep.target_module_id);
    });

    const affectedModules = Array.from(affectedModuleIds)
      .map(id => {
        const mod = this.mockModules.find(m => m.id === id);
        const riskBase = mod?.criticalityLevel === 'CRITICAL' ? 80 :
                        mod?.criticalityLevel === 'HIGH' ? 60 :
                        mod?.criticalityLevel === 'MEDIUM' ? 40 : 20;
        return {
          id: mod?.id,
          moduleName: mod?.moduleName,
          riskScore: riskBase + Math.random() * 10,
          cascadeDepth: 1
        };
      });

    const avgRisk = affectedModules.length > 0 
      ? affectedModules.reduce((sum, m) => sum + m.riskScore, 0) / affectedModules.length
      : 0;

    const riskLevel = avgRisk >= 80 ? 'CRITICAL' :
                     avgRisk >= 60 ? 'HIGH' :
                     avgRisk >= 40 ? 'MEDIUM' : 'LOW';

    return of({
      analysisId: Math.floor(Math.random() * 1000),
      affectedModules: affectedModules.sort((a, b) => b.riskScore - a.riskScore),
      riskScore: Math.round(avgRisk),
      riskLevel: riskLevel,
      cascadeDepth: 2,
      recommendations: this.generateRecommendations(riskLevel, affectedModules),
      testPlan: {
        id: Math.floor(Math.random() * 1000),
        testCaseCount: Math.ceil(affectedModules.length * 3),
        totalEffortHours: affectedModules.length * 2.5
      },
      analysisDurationMs: 2000 + Math.random() * 1000
    }).pipe(delay(1500));
  }

  // Mock Get All Analyses
  mockGetAnalyses(): Observable<any[]> {
    return of(this.mockAnalyses).pipe(delay(500));
  }

  // Helper to generate recommendations
  private generateRecommendations(riskLevel: string, affectedModules: any[]): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'CRITICAL') {
      recommendations.push('CRITICAL: Extensive testing required before deployment');
      recommendations.push('Schedule change review meeting with all stakeholders');
      recommendations.push('Prepare rollback plan');
    } else if (riskLevel === 'HIGH') {
      recommendations.push('HIGH RISK: Thorough testing recommended');
      recommendations.push('Execute all priority test cases');
    } else if (riskLevel === 'MEDIUM') {
      recommendations.push('MEDIUM RISK: Standard testing procedures apply');
      recommendations.push('Focus on affected modules for regression testing');
    } else {
      recommendations.push('LOW RISK: Minimal impact detected');
      recommendations.push('Standard deployment process can be followed');
    }

    // Add specific module recommendations
    affectedModules
      .filter(m => m.riskScore >= 70)
      .slice(0, 2)
      .forEach(m => {
        recommendations.push(`Module "${m.moduleName}" requires special attention (Risk: ${Math.round(m.riskScore)}%)`);
      });

    return recommendations;
  }
}
