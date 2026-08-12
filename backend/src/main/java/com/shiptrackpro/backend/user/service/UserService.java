package com.shiptrackpro.backend.user.service;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.shiptrackpro.backend.audit.entity.AuditAction;
import com.shiptrackpro.backend.audit.service.AuditService;
import com.shiptrackpro.backend.user.dto.UpdateUserProfileRequest;
import com.shiptrackpro.backend.user.dto.UserDto;
import com.shiptrackpro.backend.user.entity.AppUser;
import com.shiptrackpro.backend.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AuditService auditService;

    public UserDto getProfile(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User Not Found"));
        return toUserDto(user);
    }

    public void updateMyProfile(UpdateUserProfileRequest req, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User Not Found!"));
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        userRepository.save(user);
        auditService.logAction(user.getId(), AuditAction.UPDATE, "User", user.getId());
    }

    private UserDto toUserDto(AppUser user) {
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .isActive(user.getIsActive())
                .role(user.getRole())
                .build();
    }
}
