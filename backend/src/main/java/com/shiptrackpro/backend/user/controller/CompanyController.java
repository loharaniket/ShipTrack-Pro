package com.shiptrackpro.backend.user.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.user.dto.CompanyDto;
import com.shiptrackpro.backend.user.dto.CreateCompanyRequest;
import com.shiptrackpro.backend.user.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping
    public ResponseEntity<ApiResponse<CompanyDto>> createCompany(@RequestBody CreateCompanyRequest request) {
        CompanyDto response = companyService.createCompany(request);
        return ResponseEntity.ok(ApiResponse.success("Company created successfully", response));
    }
}
