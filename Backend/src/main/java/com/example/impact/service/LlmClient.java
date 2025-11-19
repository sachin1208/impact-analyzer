package com.example.impact.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * LlmClient — lightweight HTTP client for calling an LLM endpoint (OpenAI style).
 * Returns raw provider JSON. Use extractAssistantMessage() to extract the assistant text.
 */
@Component
public class LlmClient {

    private final OkHttpClient client;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String llmUrl;
    private final String apiKey;
    private final String model;

    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    public LlmClient(
            @Value("${llm.url:https://api.openai.com/v1/chat/completions}") String llmUrl,
            @Value("${llm.model:gpt-4o}") String model,
            @Value("${LLM_API_KEY:}") String apiKey
    ) {
        this.llmUrl = llmUrl;
        this.model = model;
        this.apiKey = apiKey;

        this.client = new OkHttpClient.Builder()
                .connectTimeout(Duration.ofSeconds(15))
                .readTimeout(Duration.ofSeconds(60))
                .build();
    }

    public String callLLM(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Missing LLM_API_KEY. Please set environment variable or property.");
        }

        try {
            // Build payload with Jackson
            var root = mapper.createObjectNode();
            root.put("model", model);

            var messages = root.putArray("messages");
            var msg = messages.addObject();
            msg.put("role", "user");
            msg.put("content", prompt);

            // Configure model options
            root.put("temperature", 0.2);
            root.put("max_tokens", 800);

            String bodyJson = mapper.writeValueAsString(root);

            RequestBody body = RequestBody.create(bodyJson.getBytes(StandardCharsets.UTF_8), JSON);
            Request request = new Request.Builder()
                    .url(llmUrl)
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(body)
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String err = response.body() != null ? response.body().string() : "<empty>";
                    throw new IOException("LLM responded with " + response.code() + ": " + err);
                }
                return response.body() != null ? response.body().string() : "";
            }

        } catch (IOException e) {
            throw new RuntimeException("LLM call failed", e);
        }
    }

    /**
     * Extract the assistant's content from typical provider envelope:
     * OpenAI: choices[0].message.content
     * Other: choices[0].text
     */
    public String extractAssistantMessage(String rawResponse) {
        try {
            JsonNode root = mapper.readTree(rawResponse);
            if (root.has("choices") && root.get("choices").isArray() && root.get("choices").size() > 0) {
                JsonNode first = root.get("choices").get(0);
                if (first.has("message") && first.get("message").has("content")) {
                    return first.get("message").get("content").asText();
                } else if (first.has("text")) {
                    return first.get("text").asText();
                }
            }
            return rawResponse;
        } catch (Exception e) {
            return rawResponse;
        }
    }
}
