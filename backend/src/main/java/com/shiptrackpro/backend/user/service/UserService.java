package com.shiptrackpro.backend.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.shiptrackpro.backend.user.dto.ChangePasswordRequest;
import com.shiptrackpro.backend.user.dto.UpdateProfileRequest;
import com.shiptrackpro.backend.user.dto.UserProfileResponse;
import com.shiptrackpro.backend.user.entity.AppUser;
import com.shiptrackpro.backend.user.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getMyProfile(String email) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToProfileResponse(user);
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        
        userRepository.save(user);
        return mapToProfileResponse(user);
    }

    public UserProfileResponse updateUserRole(java.util.UUID userId, String role) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        try {
            user.setRole(com.shiptrackpro.backend.user.entity.AppRole.valueOf(role.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role");
        }
        
        userRepository.save(user);
        return mapToProfileResponse(user);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid old password");
        }
        
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserProfileResponse> getUsersByCompany(UUID companyId) {
        // Since we don't have a complex query yet, we can filter in memory or add a repository method
        // For simplicity we will add a method to UserRepository: List<AppUser> findByCompanyId(UUID companyId);
        // We will assume userRepository.findByCompanyId exists. Let's write the repository method next.
        return userRepository.findByCompanyId(companyId).stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    public UserProfileResponse getUserById(UUID id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToProfileResponse(user);
    }

    public UserProfileResponse updateUserStatus(UUID id, boolean isActive) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setIsActive(isActive);
        userRepository.save(user);
        return mapToProfileResponse(user);
    }

    public void deleteUser(UUID id) {
        // Soft delete is handled by @SQLDelete on AppUser entity
        userRepository.deleteById(id);
    }

    private UserProfileResponse mapToProfileResponse(AppUser user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole() != null ? user.getRole().name() : null);
        return response;
    }
}
