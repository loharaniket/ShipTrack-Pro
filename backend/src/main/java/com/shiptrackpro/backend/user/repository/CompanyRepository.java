package com.shiptrackpro.backend.user.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrackpro.backend.user.entity.Company;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
    boolean existsByCompanyName(String companyName);
}
