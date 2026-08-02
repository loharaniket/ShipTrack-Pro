package com.shiptrackpro.backend.user.controller;

import com.shiptrackpro.backend.audit.dto.AuditLogDto;
import com.shiptrackpro.backend.audit.service.AuditService;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.user.dto.CreateUserRequest;
import com.shiptrackpro.backend.user.dto.UpdateUserRequest;
import com.shiptrackpro.backend.user.dto.UserDto;
import com.shiptrackpro.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuditService auditService;

    // administrator create internal worker account
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody CreateUserRequest request) {
        UserDto response = userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserDto> response = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable UUID id) {
        UserDto response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request) {
        UserDto response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
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
}
