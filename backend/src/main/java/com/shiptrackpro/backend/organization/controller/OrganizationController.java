package com.shiptrackpro.backend.organization.controller;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.organization.dto.*;
import com.shiptrackpro.backend.organization.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getCurrentOrganization(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        OrganizationResponse response = organizationService.getCurrentOrganization(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Organization retrieved successfully", response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateOrganization(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrganizationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRATOR"));
        OrganizationResponse response = organizationService.updateOrganization(id, request, userDetails.getUser().getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Organization updated successfully", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<OrganizationResponse>> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request) {
        OrganizationResponse response = organizationService.createOrganization(request);
        return ResponseEntity.ok(ApiResponse.success("Organization created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<OrganizationListResponse>> getOrganizations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        OrganizationListResponse response = organizationService.getOrganizations(page, size);
        return ResponseEntity.ok(ApiResponse.success("Organizations retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getOrganization(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRATOR"));
        OrganizationResponse response = organizationService.getOrganization(id, userDetails.getUser().getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Organization retrieved successfully", response));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<OrganizationMemberListResponse>> getOrganizationMembers(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRATOR"));
        OrganizationMemberListResponse response = organizationService.getOrganizationMembers(id, userDetails.getUser().getId(), isAdmin, page, size);
        return ResponseEntity.ok(ApiResponse.success("Organization members retrieved successfully", response));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<OrganizationMemberResponse>> addOrganizationMember(
            @PathVariable UUID id,
            @Valid @RequestBody AddOrganizationMemberRequest request) {
        OrganizationMemberResponse response = organizationService.addMember(id, request);
        return ResponseEntity.ok(ApiResponse.success("Member added to organization successfully", response));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<Void>> removeOrganizationMember(
            @PathVariable UUID id,
            @PathVariable UUID userId) {
        organizationService.removeMember(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Member removed from organization successfully", null));
    }
}
