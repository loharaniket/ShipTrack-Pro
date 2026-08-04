package com.shiptrackpro.backend.admin.controller;

import com.shiptrackpro.backend.admin.dto.CompanyDto;
import com.shiptrackpro.backend.admin.dto.CreateCompanyRequest;
import com.shiptrackpro.backend.admin.service.CompanyService;
import com.shiptrackpro.backend.common.response.ApiResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyDto>> createCompany(@RequestBody CreateCompanyRequest request) {
        CompanyDto response = companyService.createCompany(request);
        return ResponseEntity.ok(ApiResponse.success("Company created successfully", response));
    }
}
