package com.example.impact.model;

import jakarta.validation.constraints.NotBlank;

public class ImpactRequest {

    @NotBlank
    private String targetModule;

    @NotBlank
    private String description;

    @NotBlank
    private String category; // bug, enhancement, refactor, data-model, etc.

    // getters/setters
    public String getTargetModule() { return targetModule; }
    public void setTargetModule(String targetModule) { this.targetModule = targetModule; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
