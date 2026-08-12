package com.shiptrackpro.backend.user.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.user.dto.UpdateUserProfileRequest;
import com.shiptrackpro.backend.user.dto.UserDto;
import com.shiptrackpro.backend.user.service.UserService;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", userService.getProfile(auth)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<String>> updateMyProfile(Authentication auth,
            @RequestBody UpdateUserProfileRequest UpdateUserProfileRequest) {
        userService.updateMyProfile(UpdateUserProfileRequest, auth);
        return ResponseEntity.ok(ApiResponse.success("Profile Update Successfully",null));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<String>> updatePassword(Authentication auth, @RequestBody Object passwordRequest) {
        return ResponseEntity.ok(ApiResponse.success("Password updated", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDto>>> getUsers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", new PageImpl<>(Collections.emptyList(), pageable, 0)));
    }

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<UserDto>> inviteUser(@RequestBody Object request) {
        return ResponseEntity.ok(ApiResponse.success("User invited", UserDto.builder().build()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateStatus(@PathVariable UUID id, @RequestBody Object statusRequest) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", null));
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<String>> updateRoles(@PathVariable UUID id, @RequestBody Object rolesRequest) {
        return ResponseEntity.ok(ApiResponse.success("Roles updated", null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<Object>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", Collections.emptyList()));
    }
}
