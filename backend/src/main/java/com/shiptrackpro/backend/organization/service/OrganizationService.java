package com.shiptrackpro.backend.organization.service;

import com.shiptrackpro.backend.common.exception.ResourceNotFoundException;
import com.shiptrackpro.backend.common.exception.ResourceConflictException;
import com.shiptrackpro.backend.organization.dto.OrganizationResponse;
import com.shiptrackpro.backend.organization.dto.UpdateOrganizationRequest;
import com.shiptrackpro.backend.organization.entity.Organization;
import com.shiptrackpro.backend.organization.entity.OrganizationMember;
import com.shiptrackpro.backend.organization.repository.OrganizationMemberRepository;
import com.shiptrackpro.backend.organization.repository.OrganizationRepository;
import com.shiptrackpro.backend.organization.dto.*;
import com.shiptrackpro.backend.organization.entity.Organization;
import com.shiptrackpro.backend.organization.entity.OrganizationMember;
import com.shiptrackpro.backend.organization.entity.OrganizationStatus;
import com.shiptrackpro.backend.organization.repository.OrganizationMemberRepository;
import com.shiptrackpro.backend.organization.repository.OrganizationRepository;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public OrganizationResponse getCurrentOrganization(UUID userId) {
        List<OrganizationMember> memberships = organizationMemberRepository.findByUserId(userId);
        if (memberships.isEmpty()) {
            throw new ResourceNotFoundException("Organization not found");
        }
        
        Organization org = memberships.get(0).getOrganization();
        return mapToResponse(org);
    }

    @Transactional
    public OrganizationResponse updateOrganization(UUID organizationId, UpdateOrganizationRequest request, UUID userId, boolean isAdmin) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (!isAdmin) {
            // Verify the user is a member of this organization
            organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        }

        org.setName(request.getName());
        org.setEmail(request.getEmail());
        org.setPhone(request.getPhone());
        org.setAddressLine1(request.getAddressLine1());
        org.setAddressLine2(request.getAddressLine2());
        org.setCity(request.getCity());
        org.setState(request.getState());
        org.setPostalCode(request.getPostalCode());
        org.setCountry(request.getCountry());

        organizationRepository.save(org);

        return mapToResponse(org);
    }

    @Transactional(readOnly = true)
    public OrganizationListResponse getOrganizations(int page, int size) {
        Page<Organization> orgPage = organizationRepository.findAll(PageRequest.of(page, size));
        List<OrganizationResponse> content = orgPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return OrganizationListResponse.builder()
                .content(content)
                .page(orgPage.getNumber())
                .size(orgPage.getSize())
                .totalElements(orgPage.getTotalElements())
                .totalPages(orgPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization(UUID organizationId, UUID userId, boolean isAdmin) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        
        if (!isAdmin) {
            organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        }
                
        return mapToResponse(org);
    }

    @Transactional
    public OrganizationResponse createOrganization(CreateOrganizationRequest request) {
        if (organizationRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new ResourceConflictException("Organization code already exists");
        }

        Organization org = Organization.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .email(request.getEmail())
                .phone(request.getPhone())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .status(OrganizationStatus.ACTIVE)
                .build();

        organizationRepository.save(org);
        return mapToResponse(org);
    }

    @Transactional(readOnly = true)
    public OrganizationMemberListResponse getOrganizationMembers(UUID organizationId, UUID userId, boolean isAdmin, int page, int size) {
        if (!isAdmin) {
            organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        }

        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationId(organizationId);
        
        // Manual pagination for simplicity as requested by original simple rules
        int start = Math.min(page * size, members.size());
        int end = Math.min((page + 1) * size, members.size());
        List<OrganizationMember> pageContent = members.subList(start, end);

        List<OrganizationMemberResponse> responseList = pageContent.stream().map(m -> {
            User u = m.getUser();
            return OrganizationMemberResponse.builder()
                    .userId(u.getId())
                    .email(u.getEmail())
                    .firstName(u.getFirstName())
                    .lastName(u.getLastName())
                    .roles(u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()))
                    .status(u.getStatus())
                    .joinedAt(m.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        return OrganizationMemberListResponse.builder()
                .content(responseList)
                .page(page)
                .size(size)
                .totalElements(members.size())
                .totalPages((int) Math.ceil((double) members.size() / size))
                .build();
    }

    @Transactional
    public OrganizationMemberResponse addMember(UUID organizationId, AddOrganizationMemberRequest request) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, user.getId()).isPresent()) {
            throw new ResourceConflictException("User is already a member of this organization");
        }

        OrganizationMember member = OrganizationMember.builder()
                .organization(org)
                .user(user)
                .build();

        organizationMemberRepository.save(member);

        return OrganizationMemberResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()))
                .status(user.getStatus())
                .joinedAt(member.getCreatedAt())
                .build();
    }

    @Transactional
    public void removeMember(UUID organizationId, UUID userIdToRemove) {
        OrganizationMember member = organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, userIdToRemove)
                .orElseThrow(() -> new ResourceNotFoundException("Organization member not found"));

        organizationMemberRepository.delete(member);
    }

    private OrganizationResponse mapToResponse(Organization org) {
        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .code(org.getCode())
                .email(org.getEmail())
                .phone(org.getPhone())
                .addressLine1(org.getAddressLine1())
                .addressLine2(org.getAddressLine2())
                .city(org.getCity())
                .state(org.getState())
                .postalCode(org.getPostalCode())
                .country(org.getCountry())
                .status(org.getStatus())
                .build();
    }
}
