package com.shiptrackpro.backend.auth.controller;

import com.shiptrackpro.backend.auth.dto.AuthResponse;
import com.shiptrackpro.backend.auth.dto.LoginRequest;
import com.shiptrackpro.backend.auth.dto.OAuth2LoginRequest;
import com.shiptrackpro.backend.auth.dto.RegisterRequest;
import com.shiptrackpro.backend.auth.service.AuthService;
import com.shiptrackpro.backend.common.response.ApiResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request) {
        System.out.println("Request Accept!");
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/oauth2/{provider}")
    public ResponseEntity<ApiResponse<AuthResponse>> oauth2Login(
            @PathVariable String provider,
            @RequestBody OAuth2LoginRequest request) {
        AuthResponse response = authService.oauth2Login(provider, request);
        return ResponseEntity.ok(ApiResponse.success("OAuth2 login successful", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @RequestBody com.shiptrackpro.backend.auth.dto.ForgotPasswordRequest request) {
        String token = authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset token generated", token));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @RequestBody com.shiptrackpro.backend.auth.dto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestBody com.shiptrackpro.backend.auth.dto.RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(org.springframework.security.core.Authentication authentication) {
        authService.logout(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
