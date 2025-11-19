package com.example.impact.model;

import java.util.List;

public class ImpactResponse {
    private String risk; // low|medium|high
    private int riskScore;
    private int cascadeDepth; // up to 3
    private List<AffectedModule> affectedModules;
    private List<AffectedTestCase> affectedTestCases;
    private Recommendations recommendations;
    private String notes; // optional: technical notes or raw LLM message excerpt

    // nested classes
    public static class AffectedModule {
        private String moduleName;
        private String impact; // minor|moderate|major
        private String reason;
        private List<String> propagationPath;

        public String getModuleName() { return moduleName; }
        public void setModuleName(String moduleName) { this.moduleName = moduleName; }
        public String getImpact() { return impact; }
        public void setImpact(String impact) { this.impact = impact; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public List<String> getPropagationPath() { return propagationPath; }
        public void setPropagationPath(List<String> propagationPath) { this.propagationPath = propagationPath; }
    }

    public static class AffectedTestCase {
        private String testId;
        private String location;
        private String priority; // P0|P1|P2
        private String type; // unit|integration|e2e
        private String reason;

        public String getTestId() { return testId; }
        public void setTestId(String testId) { this.testId = testId; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class Recommendations {
        private List<String> codeChanges;
        private List<String> testsToRun;
        private List<String> dataMigrations;
        private List<String> deployment;
        private List<String> rollback;
        private String estimatedEffort;
        private String notes;

        public List<String> getCodeChanges() { return codeChanges; }
        public void setCodeChanges(List<String> codeChanges) { this.codeChanges = codeChanges; }
        public List<String> getTestsToRun() { return testsToRun; }
        public void setTestsToRun(List<String> testsToRun) { this.testsToRun = testsToRun; }
        public List<String> getDataMigrations() { return dataMigrations; }
        public void setDataMigrations(List<String> dataMigrations) { this.dataMigrations = dataMigrations; }
        public List<String> getDeployment() { return deployment; }
        public void setDeployment(List<String> deployment) { this.deployment = deployment; }
        public List<String> getRollback() { return rollback; }
        public void setRollback(List<String> rollback) { this.rollback = rollback; }
        public String getEstimatedEffort() { return estimatedEffort; }
        public void setEstimatedEffort(String estimatedEffort) { this.estimatedEffort = estimatedEffort; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    // root getters/setters
    public String getRisk() { return risk; }
    public void setRisk(String risk) { this.risk = risk; }
    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }
    public int getCascadeDepth() { return cascadeDepth; }
    public void setCascadeDepth(int cascadeDepth) { this.cascadeDepth = cascadeDepth; }
    public List<AffectedModule> getAffectedModules() { return affectedModules; }
    public void setAffectedModules(List<AffectedModule> affectedModules) { this.affectedModules = affectedModules; }
    public List<AffectedTestCase> getAffectedTestCases() { return affectedTestCases; }
    public void setAffectedTestCases(List<AffectedTestCase> affectedTestCases) { this.affectedTestCases = affectedTestCases; }
    public Recommendations getRecommendations() { return recommendations; }
    public void setRecommendations(Recommendations recommendations) { this.recommendations = recommendations; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
