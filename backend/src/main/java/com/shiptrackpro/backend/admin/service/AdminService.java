package com.shiptrackpro.backend.admin.service;

import java.time.ZonedDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.shiptrackpro.backend.admin.dto.CreateUserRequest;
import com.shiptrackpro.backend.admin.dto.UpdateUserRequest;
import com.shiptrackpro.backend.admin.repository.CompanyRepository;
import com.shiptrackpro.backend.audit.entity.AuditAction;
import com.shiptrackpro.backend.audit.service.AuditService;
import com.shiptrackpro.backend.user.dto.UserDto;
import com.shiptrackpro.backend.user.entity.AppRole;
import com.shiptrackpro.backend.user.entity.AppUser;
import com.shiptrackpro.backend.user.entity.Company;
import com.shiptrackpro.backend.user.repository.UserRepository;
import com.shiptrackpro.backend.delivery.entity.Driver;
import com.shiptrackpro.backend.delivery.repository.DriverRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final DriverRepository driverRepository;

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

        if (savedUser.getRole() == AppRole.LOGISTICS_OPERATOR) {
            if (request.getLicenseNumber() == null || request.getExperienceYears() == null) {
                throw new IllegalArgumentException("License number and experience years are required for Logistics Operators");
            }
            Driver driver = new Driver();
            driver.setUser(savedUser);
            driver.setLicenseNumber(request.getLicenseNumber());
            driver.setExperienceYears(request.getExperienceYears());
            driverRepository.save(driver);
        }

        return toUserDto(savedUser);
    }

    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toUserDto);
    }

    public UserDto getUserById(UUID id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toUserDto(user);
    }

    public UserDto updateUser(UUID id, UpdateUserRequest request) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getFirstName() != null)
            user.setFirstName(request.getFirstName());
        if (request.getLastName() != null)
            user.setLastName(request.getLastName());
        if (request.getIsActive() != null)
            user.setIsActive(request.getIsActive());

        AppUser updatedUser = userRepository.save(user);
        auditService.logAction(updatedUser.getId(), AuditAction.UPDATE, "User", updatedUser.getId());

        return toUserDto(updatedUser);
    }

    public void deleteUser(UUID id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setIsActive(false);
        user.setDeletedAt(ZonedDateTime.now());
        userRepository.save(user);

        auditService.logAction(id, AuditAction.DELETE, "User", id);
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
