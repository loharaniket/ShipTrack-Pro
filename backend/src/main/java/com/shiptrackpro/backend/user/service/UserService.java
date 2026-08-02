package com.shiptrackpro.backend.user.service;

import com.shiptrackpro.backend.audit.entity.AuditAction;
import com.shiptrackpro.backend.audit.service.AuditService;
import com.shiptrackpro.backend.user.dto.CreateUserRequest;
import com.shiptrackpro.backend.user.dto.UpdateUserRequest;
import com.shiptrackpro.backend.user.dto.UserDto;
import com.shiptrackpro.backend.user.entity.AppRole;
import com.shiptrackpro.backend.user.entity.AppUser;
import com.shiptrackpro.backend.user.entity.Company;
import com.shiptrackpro.backend.user.repository.CompanyRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        AppUser user = new AppUser();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole() != null ? request.getRole() : AppRole.CUSTOMER);

        if (request.getCompanyId() != null) {
            Company company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new IllegalArgumentException("Company not found"));
            user.setCompany(company);
        }

        AppUser savedUser = userRepository.save(user);
        auditService.logAction(savedUser.getId(), AuditAction.CREATE, "User", savedUser.getId());

        return mapToDto(savedUser);
    }

    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToDto);
    }

    public UserDto getUserById(UUID id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToDto(user);
    }

    public UserDto updateUser(UUID id, UpdateUserRequest request) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());

        AppUser updatedUser = userRepository.save(user);
        auditService.logAction(updatedUser.getId(), AuditAction.UPDATE, "User", updatedUser.getId());

        return mapToDto(updatedUser);
    }

    public void deleteUser(UUID id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setIsActive(false);
        user.setDeletedAt(ZonedDateTime.now());
        userRepository.save(user);
        
        auditService.logAction(id, AuditAction.DELETE, "User", id);
    }

    private UserDto mapToDto(AppUser user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        dto.setLastLogin(user.getLastLogin());
        
        if (user.getCompany() != null) {
            dto.setCompanyId(user.getCompany().getId());
        }
        
        return dto;
    }
}
