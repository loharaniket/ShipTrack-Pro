package com.shiptrack.backend.controller;

import com.shiptrack.backend.dto.JwtResponse;
import com.shiptrack.backend.dto.LoginRequest;
import com.shiptrack.backend.dto.RegisterRequest;
import com.shiptrack.backend.service.AuthService;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        String responseMessage = authService.registerUser(signUpRequest);
        return ResponseEntity.ok(responseMessage);
    }
}
