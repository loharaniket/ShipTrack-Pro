package com.shiptrack.backend.service;

import com.shiptrack.backend.dto.JwtResponse;
import com.shiptrack.backend.dto.LoginRequest;
import com.shiptrack.backend.dto.RegisterRequest;
import com.shiptrack.backend.model.Role;
import com.shiptrack.backend.model.User;
import com.shiptrack.backend.repository.UserRepository;
import com.shiptrack.backend.security.JwtUtils;
import com.shiptrack.backend.security.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final UserActivityService activityService;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       PasswordEncoder encoder, JwtUtils jwtUtils, UserActivityService activityService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.activityService = activityService;
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        
        activityService.logActivity(user, "LOGGED_IN");

        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), roles);
    }

    public String registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        
        Role role = Role.CUSTOMER;
        if (signUpRequest.getRole() != null) {
            if (signUpRequest.getRole().equalsIgnoreCase("BUSINESS_CLIENT")) {
                role = Role.BUSINESS_CLIENT;
            }
            
        }

        
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(role);
        
        user.setEmail(signUpRequest.getEmail());
        user.setPhone(signUpRequest.getPhone());
        user.setCompanyName(signUpRequest.getCompanyName());

        userRepository.save(user);

        
        activityService.logActivity(user, "REGISTERED_AS_" + role.name());

        return "User registered successfully!";
    }
}
