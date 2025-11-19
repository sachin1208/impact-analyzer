// java
package com.example.impact.controller;

import com.example.impact.model.OllamaRequest;
import com.example.impact.service.OllamaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ollama")
public class OllamaController {
    private final OllamaService ollamaService;

    public OllamaController(OllamaService ollamaService) {
        this.ollamaService = ollamaService;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generate(@RequestBody OllamaRequest request) {
        if (request.getPrompt() == null || request.getPrompt().isBlank()) {
            return ResponseEntity.badRequest().body("`prompt` is required");
        }
        String result = ollamaService.generate(request);
        return ResponseEntity.ok(result);
    }
}
