package com.shiptrackpro.backend.user.service;

import com.shiptrackpro.backend.user.dto.CompanyDto;
import com.shiptrackpro.backend.user.dto.CreateCompanyRequest;
import com.shiptrackpro.backend.user.entity.Company;
import com.shiptrackpro.backend.user.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyDto createCompany(CreateCompanyRequest request) {
        Company company = new Company();
        company.setCompanyName(request.getCompanyName());
        company.setEmail(request.getEmail());
        company.setPhone(request.getPhone());
        company.setWebsite(request.getWebsite());

        Company savedCompany = companyRepository.save(company);

        return mapToDto(savedCompany);
    }

    private CompanyDto mapToDto(Company company) {
        CompanyDto dto = new CompanyDto();
        dto.setId(company.getId());
        dto.setCompanyName(company.getCompanyName());
        dto.setEmail(company.getEmail());
        dto.setPhone(company.getPhone());
        dto.setWebsite(company.getWebsite());
        dto.setCreatedAt(company.getCreatedAt());
        return dto;
    }
}
