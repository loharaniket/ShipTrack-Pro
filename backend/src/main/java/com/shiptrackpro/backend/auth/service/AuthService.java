package com.shiptrackpro.backend.auth.service;

import com.shiptrackpro.backend.auth.dto.AuthResponse;
import com.shiptrackpro.backend.auth.dto.ForgotPasswordRequest;
import com.shiptrackpro.backend.auth.dto.LoginRequest;
import com.shiptrackpro.backend.auth.dto.OAuth2LoginRequest;
import com.shiptrackpro.backend.auth.dto.RefreshTokenRequest;
import com.shiptrackpro.backend.auth.dto.RegisterRequest;
import com.shiptrackpro.backend.auth.dto.ResetPasswordRequest;
import com.shiptrackpro.backend.security.CustomUserDetailsService;
import com.shiptrackpro.backend.security.JwtService;
import com.shiptrackpro.backend.user.entity.AppUser;
import com.shiptrackpro.backend.user.entity.UserSession;
import com.shiptrackpro.backend.user.repository.UserRepository;
import com.shiptrackpro.backend.user.repository.UserSessionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final UserSessionRepository userSessionRepository;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        AppUser user = new AppUser();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(com.shiptrackpro.backend.user.entity.AppRole.CUSTOMER);

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        saveUserSession(user, refreshToken);
        
        return new AuthResponse(jwtToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        
        AppUser user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        saveUserSession(user, refreshToken);
        
        return new AuthResponse(jwtToken, refreshToken);
    }

    public AuthResponse oauth2Login(String provider, OAuth2LoginRequest request) {
        String email = request.getIdToken(); 
        
        AppUser user = userRepository.findByEmail(email).orElseGet(() -> {
            AppUser newUser = new AppUser();
            newUser.setEmail(email);
            newUser.setPasswordHash("");
            newUser.setFirstName("OAuth2");
            newUser.setLastName("User");
            newUser.setRole(com.shiptrackpro.backend.user.entity.AppRole.CUSTOMER);
            return userRepository.save(newUser);
        });

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        saveUserSession(user, refreshToken);
        
        return new AuthResponse(jwtToken, refreshToken);
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        AppUser user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return jwtService.generateToken(userDetails);
    }

    public void resetPassword(ResetPasswordRequest request) {
        String email = jwtService.extractUsername(request.getToken());
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        
        if (jwtService.isTokenValid(request.getToken(), userDetails)) {
            AppUser user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
        } else {
            throw new IllegalArgumentException("Invalid token");
        }
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String email = jwtService.extractUsername(refreshToken);
        
        if (email != null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            
            if (jwtService.isTokenValid(refreshToken, userDetails)) {
                UserSession session = userSessionRepository.findByRefreshToken(refreshToken)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
                System.out.println(session.getUser().getEmail());
                String accessToken = jwtService.generateToken(userDetails);
                return new AuthResponse(accessToken, refreshToken);
            }
        }
        throw new IllegalArgumentException("Invalid refresh token");
    }

    @Transactional
    public void logout(String email) {
        AppUser user = userRepository.findByEmail(email).orElseThrow();
        userSessionRepository.deleteByUserId(user.getId());
    }

    private void saveUserSession(AppUser user, String refreshToken) {
        UserSession session = new UserSession();
        session.setUser(user);
        session.setRefreshToken(refreshToken);
        session.setExpiresAt(java.time.ZonedDateTime.now().plusDays(7));
        userSessionRepository.save(session);
    }
}
