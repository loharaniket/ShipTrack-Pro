package com.shiptrackpro.backend.auth.controller;

import com.shiptrackpro.backend.auth.dto.AuthResponse;
import com.shiptrackpro.backend.auth.dto.ForgotPasswordRequest;
import com.shiptrackpro.backend.auth.dto.LoginRequest;
import com.shiptrackpro.backend.auth.dto.OAuth2LoginRequest;
import com.shiptrackpro.backend.auth.dto.RefreshTokenRequest;
import com.shiptrackpro.backend.auth.dto.RegisterRequest;
import com.shiptrackpro.backend.auth.dto.ResetPasswordRequest;
import com.shiptrackpro.backend.auth.service.AuthService;
import com.shiptrackpro.backend.common.response.ApiResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/oauth2/callback")
    public ResponseEntity<ApiResponse<AuthResponse>> oauth2Login(
            @RequestBody OAuth2LoginRequest request) {
        AuthResponse response = authService.oauth2Login(request);
        return ResponseEntity.ok(ApiResponse.success("OAuth2 login successful", response));
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<ApiResponse<String>> passwordResetRequest(
            @RequestBody ForgotPasswordRequest request) {
        String token = authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset token generated", token));
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<ApiResponse<String>> passwordResetConfirm(
            @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<String>>> getRoles() {
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved", List.of("CUSTOMER", "ADMIN", "DRIVER", "SUPPORT")));
    }

    @PutMapping("/roles/{roleId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateRole(@PathVariable String roleId, @RequestBody Map<String, Object> scopes) {
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", Map.of("role", roleId, "status", "UPDATED")));
    }
}
