// java
package com.example.impact.model;

public class OllamaRequest {
    private String prompt;
    private String model;
    private Object options;

    public OllamaRequest() {}

    public OllamaRequest(String prompt, String model, Object options) {
        this.prompt = prompt;
        this.model = model;
        this.options = options;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Object getOptions() {
        return options;
    }

    public void setOptions(Object options) {
        this.options = options;
    }
}
