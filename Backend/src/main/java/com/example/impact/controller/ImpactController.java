package com.example.impact.controller;

import com.example.impact.model.ImpactRequest;
import com.example.impact.model.ImpactResponse;
import com.example.impact.service.ImpactService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/impact")
public class ImpactController {

    private final ImpactService impactService;

    public ImpactController(ImpactService impactService) {
        this.impactService = impactService;
    }

    @PostMapping
    public ResponseEntity<ImpactResponse> analyze(@Valid @RequestBody ImpactRequest request) {
        ImpactResponse resp = impactService.analyzeImpact(request);
        return ResponseEntity.ok(resp);
    }
}
