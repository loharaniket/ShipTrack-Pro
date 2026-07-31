package com.shiptrackpro.backend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrackpro.backend.user.entity.AppUser;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
    List<AppUser> findByCompanyId(UUID companyId);
}
