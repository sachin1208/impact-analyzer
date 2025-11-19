package com.example.impact.service;

import com.example.impact.model.ImpactRequest;
import com.example.impact.model.ImpactResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImpactService {

    private final LlmClient llmClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public ImpactService(LlmClient llmClient) {
        this.llmClient = llmClient;
    }

    public ImpactResponse analyzeImpact(ImpactRequest request) {
        // 1) Build prompt
        String prompt = buildPrompt(request);

        // 2) Call LLM
        String raw = llmClient.callLLM(prompt);

        // 3) Extract assistant content (OpenAI-like)
        String assistantText = llmClient.extractAssistantMessage(raw);

        // 4) Try to parse assistant JSON into ImpactResponse
        try {
            ImpactResponse resp = mapper.readValue(assistantText, ImpactResponse.class);
            // Basic validation: cascadeDepth max 3
            if (resp.getCascadeDepth() > 3) resp.setCascadeDepth(3);
            return resp;
        } catch (Exception e) {
            // Try to extract JSON substring heuristically
            try {
                String jsonPart = extractJsonPart(assistantText);
                ImpactResponse resp = mapper.readValue(jsonPart, ImpactResponse.class);
                if (resp.getCascadeDepth() > 3) resp.setCascadeDepth(3);
                return resp;
            } catch (Exception ex) {
                // Final fallback — conservative default
                ImpactResponse fallback = new ImpactResponse();
                fallback.setRisk("medium");
                fallback.setRiskScore(50);
                fallback.setCascadeDepth(1);

// build one AffectedModule
                ImpactResponse.AffectedModule am = new ImpactResponse.AffectedModule();
                am.setModuleName(request.getTargetModule());
                am.setImpact("minor");
                am.setReason("Fallback: LLM response could not be parsed");
                am.setPropagationPath(List.of(request.getTargetModule()));
                fallback.setAffectedModules(List.of(am));

// optionally build an empty AffectedTestCase list or add an example
                fallback.setAffectedTestCases(List.of()); // empty list

// recommendations
                ImpactResponse.Recommendations rec = new ImpactResponse.Recommendations();
                rec.setNotes("LLM output could not be parsed. Raw assistant text truncated in notes.");
                rec.setCodeChanges(List.of("Add integration tests", "Verify migrations"));
                fallback.setRecommendations(rec);

// include truncated raw assistant text for debugging (keep small)
                fallback.setNotes(truncate(assistantText, 2000));

                return fallback;
            }
        }
    }

    private String buildPrompt(ImpactRequest req) {
        // Minimal structured prompt. In production add module metadata + top-k docs for grounding.
        return """
                You are a software impact analysis assistant. Output ONLY a single JSON object matching the schema below (no extra commentary).
                Schema:
                {
                  "risk":"low|medium|high",
                  "riskScore":0-100,
                  "cascadeDepth":0-3,
                  "affectedModules":[{"moduleName":"string","impact":"minor|moderate|major","reason":"string","propagationPath":["ModuleA","ModuleB"]}],
                  "affectedTestCases":[{"testId":"string","location":"path/to/test","priority":"P0|P1|P2","type":"unit|integration|e2e","reason":"string"}],
                  "recommendations":{"codeChanges":[],"testsToRun":[],"dataMigrations":[],"deployment":[],"rollback":[],"estimatedEffort":"","notes":""}
                }
                Input:
                - targetModule: %s
                - description: %s
                - category: %s
                Provide concise JSON only.
                """.formatted(req.getTargetModule(), req.getDescription(), req.getCategory());
    }

    private String extractJsonPart(String text) {
        int first = text.indexOf('{');
        int last = text.lastIndexOf('}');
        if (first >= 0 && last > first) {
            return text.substring(first, last + 1);
        }
        return text;
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
