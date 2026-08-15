package com.shiptrackpro.backend.user.service;

import com.shiptrackpro.backend.auth.entity.RefreshToken;
import com.shiptrackpro.backend.auth.repository.RefreshTokenRepository;
import com.shiptrackpro.backend.user.dto.*;
import com.shiptrackpro.backend.user.entity.Role;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.entity.UserStatus;
import com.shiptrackpro.backend.user.repository.RoleRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String search, String status, String role, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), searchPattern);
                Predicate firstNamePredicate = cb.like(cb.lower(root.get("firstName")), searchPattern);
                Predicate lastNamePredicate = cb.like(cb.lower(root.get("lastName")), searchPattern);
                predicates.add(cb.or(emailPredicate, firstNamePredicate, lastNamePredicate));
            }

            if (StringUtils.hasText(status)) {
                try {
                    predicates.add(cb.equal(root.get("status"), UserStatus.valueOf(status.toUpperCase())));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid status
                }
            }

            if (StringUtils.hasText(role)) {
                try {
                    RoleName roleName = RoleName.valueOf(role.toUpperCase());
                    predicates.add(cb.equal(root.join("roles").get("name"), roleName));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid role
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable).map(this::mapToUserResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String email = request.getEmail().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        Set<Role> roles = request.getRoles().stream()
                .map(roleStr -> {
                    try {
                        return roleRepository.findByName(RoleName.valueOf(roleStr.toUpperCase()))
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not found: " + roleStr));
                    } catch (IllegalArgumentException e) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + roleStr);
                    }
                })
                .collect(Collectors.toSet());

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .status(UserStatus.ACTIVE)
                .roles(roles)
                .build();

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (StringUtils.hasText(request.getFirstName())) {
            user.setFirstName(request.getFirstName());
        }
        if (StringUtils.hasText(request.getLastName())) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (StringUtils.hasText(request.getStatus())) {
            try {
                UserStatus newStatus = UserStatus.valueOf(request.getStatus().toUpperCase());
                user.setStatus(newStatus);
                
                if (newStatus == UserStatus.INACTIVE || newStatus == UserStatus.SUSPENDED) {
                    revokeAllUserRefreshTokens(user.getId());
                }
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + request.getStatus());
            }
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Role> roles = request.getRoles().stream()
                    .map(roleStr -> {
                        try {
                            return roleRepository.findByName(RoleName.valueOf(roleStr.toUpperCase()))
                                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not found: " + roleStr));
                        } catch (IllegalArgumentException e) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + roleStr);
                        }
                    })
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public void changePassword(UUID id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Revoke refresh tokens on password change
        revokeAllUserRefreshTokens(user.getId());
    }

    private void revokeAllUserRefreshTokens(UUID userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserId(userId);
        for (RefreshToken token : tokens) {
            token.setRevokedAt(ZonedDateTime.now());
        }
        refreshTokenRepository.saveAll(tokens);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .status(user.getStatus().name())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
