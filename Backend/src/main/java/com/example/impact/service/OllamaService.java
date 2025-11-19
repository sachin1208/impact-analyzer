// java
package com.example.impact.service;

import com.example.impact.model.OllamaRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class OllamaService {
    private final RestTemplate restTemplate;
    private final String ollamaUrl = "http://localhost:11434/api/generate";

    public OllamaService() {
        this.restTemplate = new RestTemplate();
    }

    public String generate(OllamaRequest request) {
        String model = (request.getModel() != null && !request.getModel().isBlank()) ?
                request.getModel() : "deepseek-r1";

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("prompt", request.getPrompt());
        if (request.getOptions() != null) {
            body.put("options", request.getOptions());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        return restTemplate.postForObject(ollamaUrl, entity, String.class);
    }
}
