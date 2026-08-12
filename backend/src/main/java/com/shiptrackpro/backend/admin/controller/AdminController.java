package com.shiptrackpro.backend.admin.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shiptrackpro.backend.admin.dto.CreateUserRequest;
import com.shiptrackpro.backend.admin.dto.UpdateUserRequest;
import com.shiptrackpro.backend.admin.service.AdminService;
import com.shiptrackpro.backend.audit.dto.AuditLogDto;
import com.shiptrackpro.backend.audit.service.AuditService;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.user.dto.UserDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final AuditService auditService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody CreateUserRequest request) {
        UserDto response = adminService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserDto> response = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable UUID id) {
        UserDto response = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request) {
        UserDto response = adminService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User soft deleted successfully", null));
    }

    @GetMapping("/{id}/activity")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getUserActivity(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLogDto> response = auditService.getUserActivity(id, pageable);
        return ResponseEntity.ok(ApiResponse.success("User activity fetched successfully", response));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success("Settings retrieved", java.util.Map.of("TIMEZONE", "UTC")));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> updateSettings(@RequestBody java.util.Map<String, String> settings) {
        return ResponseEntity.ok(ApiResponse.success("Settings updated", settings));
    }
}
