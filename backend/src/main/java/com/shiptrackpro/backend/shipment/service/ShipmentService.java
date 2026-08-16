package com.shiptrackpro.backend.shipment.service;

import com.shiptrackpro.backend.organization.entity.Organization;
import com.shiptrackpro.backend.organization.entity.OrganizationMember;
import com.shiptrackpro.backend.organization.repository.OrganizationMemberRepository;
import com.shiptrackpro.backend.shipment.dto.*;
import com.shiptrackpro.backend.shipment.entity.ShipmentPackage;
import com.shiptrackpro.backend.shipment.entity.*;
import com.shiptrackpro.backend.shipment.repository.*;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final AddressRepository addressRepository;
    private final ShipmentPackageRepository packageRepository;
    private final ShipmentHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final com.shiptrackpro.backend.organization.repository.OrganizationRepository organizationRepository;
    private final EntityManager entityManager;

    private Organization getUserOrganization(User user) {
        List<OrganizationMember> members = organizationMemberRepository.findByUserId(user.getId());
        if (members.isEmpty()) {
            // Auto-create personal organization if it doesn't exist
            String orgCode = "ORG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Organization org = Organization.builder()
                    .name(user.getFirstName() + "'s Organization")
                    .code(orgCode)
                    .status(com.shiptrackpro.backend.organization.entity.OrganizationStatus.ACTIVE)
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .build();
            organizationRepository.save(org);

            OrganizationMember member = OrganizationMember.builder()
                    .organization(org)
                    .user(user)
                    .build();
            organizationMemberRepository.save(member);
            return org;
        }
        return members.get(0).getOrganization();
    }

    @Transactional
    public ShipmentResponse createShipment(@Valid CreateShipmentRequest request, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Organization org = getUserOrganization(user);

        Shipment shipment = new Shipment();
        shipment.setTrackingNumber(generateTrackingNumber());
        shipment.setOrganization(org);
        shipment.setCreatedBy(user);
        shipment.setServiceType(request.getServiceType());
        shipment.setPriority(request.getPriority());
        shipment.setStatus(ShipmentStatus.DRAFT);
        shipment.setCustomerName(request.getCustomerName());
        shipment.setRecipientName(request.getRecipientName());
        shipment.setRecipientPhone(request.getRecipientPhone());
        
        Address destination = saveAddress(request.getDeliveryAddress());
        shipment.setDestinationAddress(destination);

        if (request.getOriginAddress() != null) {
            Address origin = saveAddress(request.getOriginAddress());
            shipment.setOriginAddress(origin);
        }

        Shipment savedShipment = shipmentRepository.save(shipment);

        if (request.getPackages() != null) {
            for (ShipmentPackageDto pkgDto : request.getPackages()) {
                ShipmentPackage pkg = new ShipmentPackage();
                pkg.setShipment(savedShipment);
                pkg.setDescription(pkgDto.getDescription());
                pkg.setWeightKg(pkgDto.getWeightKg());
                pkg.setLengthCm(pkgDto.getLengthCm());
                pkg.setWidthCm(pkgDto.getWidthCm());
                pkg.setHeightCm(pkgDto.getHeightCm());
                packageRepository.save(pkg);
            }
        }

        logHistory(savedShipment, null, ShipmentStatus.DRAFT, "Shipment created", user, null);

        return getShipmentByTrackingNumber(user, savedShipment.getTrackingNumber());
    }

    public Page<ShipmentResponse> getShipments(User authUser, Pageable pageable, Optional<String> search, Optional<String> statusStr) {
        boolean isAdmin = authUser.getRoles().stream()
                .anyMatch(r -> r.getName() == com.shiptrackpro.backend.user.entity.RoleName.ADMINISTRATOR || r.getName() == com.shiptrackpro.backend.user.entity.RoleName.DRIVER);

        ShipmentStatus status = statusStr.map(s -> {
            try {
                return ShipmentStatus.valueOf(s);
            } catch (Exception e) {
                return null;
            }
        }).orElse(null);

        if (isAdmin) {
            // Admins see ALL shipments across all organizations
            if (search.isPresent() && !search.get().isBlank()) {
                if (status != null) {
                    return shipmentRepository.findAllBySearchAndStatus(search.get(), status, pageable).map(this::toResponse);
                } else {
                    return shipmentRepository.findAllBySearch(search.get(), pageable).map(this::toResponse);
                }
            } else {
                if (status != null) {
                    return shipmentRepository.findAllByStatus(status, pageable).map(this::toResponse);
                } else {
                    return shipmentRepository.findAll(pageable).map(this::toResponse);
                }
            }
        }

        // Non-admin users: filter by their organization
        UUID orgId = getUserOrganization(authUser).getId();
        if (search.isPresent() && !search.get().isBlank()) {
            if (status != null) {
                return shipmentRepository.findAllByOrganizationIdAndSearchAndStatus(orgId, search.get(), status, pageable).map(this::toResponse);
            } else {
                return shipmentRepository.findAllByOrganizationIdAndSearch(orgId, search.get(), pageable).map(this::toResponse);
            }
        } else {
            if (status != null) {
                return shipmentRepository.findAllByOrganizationIdAndStatus(orgId, status, pageable).map(this::toResponse);
            } else {
                return shipmentRepository.findAllByOrganizationId(orgId, pageable).map(this::toResponse);
            }
        }
    }

    public ShipmentResponse getShipmentByTrackingNumber(User authUser, String trackingNumber) {
        boolean isAdmin = authUser.getRoles().stream()
                .anyMatch(r -> r.getName() == com.shiptrackpro.backend.user.entity.RoleName.ADMINISTRATOR || r.getName() == com.shiptrackpro.backend.user.entity.RoleName.DRIVER);

        Shipment shipment;
        if (isAdmin) {
            shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));
        } else {
            UUID orgId = getUserOrganization(authUser).getId();
            shipment = shipmentRepository.findByTrackingNumberAndOrganizationId(trackingNumber, orgId)
                    .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));
        }
        return toResponse(shipment);
    }

    @Transactional
    public ShipmentResponse updateShipment(UUID shipmentId, UpdateShipmentRequest request, User authUser) {
        boolean isAdmin = authUser.getRoles().stream()
                .anyMatch(r -> r.getName() == com.shiptrackpro.backend.user.entity.RoleName.ADMINISTRATOR);

        Shipment shipment;
        if (isAdmin) {
            shipment = shipmentRepository.findById(shipmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));
        } else {
            UUID orgId = getUserOrganization(authUser).getId();
            shipment = shipmentRepository.findByIdAndOrganizationId(shipmentId, orgId)
                    .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));
        }

        if (request.getPriority() != null) shipment.setPriority(request.getPriority());
        if (request.getScheduledPickup() != null) shipment.setScheduledPickup(request.getScheduledPickup());
        if (request.getScheduledDelivery() != null) shipment.setScheduledDelivery(request.getScheduledDelivery());

        if (request.getDeliveryInstructions() != null && shipment.getDestinationAddress() != null) {
            shipment.getDestinationAddress().setDeliveryInstructions(request.getDeliveryInstructions());
            addressRepository.save(shipment.getDestinationAddress());
        }

        Shipment saved = shipmentRepository.save(shipment);
        return toResponse(saved);
    }

    @Transactional
    public ShipmentResponse updateShipmentStatus(UUID shipmentId, UpdateShipmentStatusRequest request, User authUser) {
        boolean isAdmin = authUser.getRoles().stream()
                .anyMatch(r -> r.getName() == com.shiptrackpro.backend.user.entity.RoleName.ADMINISTRATOR);

        Shipment shipment;
        if (isAdmin) {
            shipment = shipmentRepository.findById(shipmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));
        } else {
            UUID orgId = getUserOrganization(authUser).getId();
            shipment = shipmentRepository.findByIdAndOrganizationId(shipmentId, orgId)
                    .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));
        }

        ShipmentStatus oldStatus = shipment.getStatus();
        shipment.setStatus(request.getNewStatus());
        Shipment saved = shipmentRepository.save(shipment);

        logHistory(saved, oldStatus, request.getNewStatus(), request.getNote(), authUser, request.getLocation());
        return toResponse(saved);
    }

    private void logHistory(Shipment shipment, ShipmentStatus prev, ShipmentStatus curr, String note, User user, String location) {
        ShipmentHistory history = new ShipmentHistory();
        history.setShipment(shipment);
        history.setPreviousStatus(prev);
        history.setNewStatus(curr);
        history.setNote(note);
        history.setChangedBy(user);
        history.setLocation(location);
        historyRepository.save(history);
    }

    private Address saveAddress(AddressDto dto) {
        if (dto == null) return null;
        Address address = new Address();
        address.setLine1(dto.getLine1());
        address.setLine2(dto.getLine2());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setCountry(dto.getCountry());
        address.setPostalCode(dto.getPostalCode());
        address.setLatitude(dto.getLatitude());
        address.setLongitude(dto.getLongitude());
        address.setContactName(dto.getContactName());
        address.setContactPhone(dto.getContactPhone());
        address.setDeliveryInstructions(dto.getDeliveryInstructions());
        return addressRepository.save(address);
    }

    private String generateTrackingNumber() {
        Long seq = ((Number) entityManager.createNativeQuery("SELECT nextval('shipment_seq')").getSingleResult()).longValue();
        return String.format("STP-%06d", seq);
    }

    private ShipmentResponse toResponse(Shipment s) {
        ShipmentResponse res = new ShipmentResponse();
        res.setId(s.getId());
        res.setTrackingNumber(s.getTrackingNumber());
        res.setOrganizationId(s.getOrganization().getId());
        res.setServiceType(s.getServiceType());
        res.setPriority(s.getPriority());
        res.setStatus(s.getStatus());
        res.setCustomerName(s.getCustomerName());
        res.setRecipientName(s.getRecipientName());
        res.setRecipientPhone(s.getRecipientPhone());
        res.setOriginAddress(toAddressDto(s.getOriginAddress()));
        res.setDestinationAddress(toAddressDto(s.getDestinationAddress()));
        res.setScheduledPickup(s.getScheduledPickup());
        res.setScheduledDelivery(s.getScheduledDelivery());
        res.setCreatedAt(s.getCreatedAt());
        res.setUpdatedAt(s.getUpdatedAt());

        List<ShipmentPackageDto> pkgs = packageRepository.findByShipmentId(s.getId()).stream()
                .map(this::toPackageDto).collect(Collectors.toList());
        res.setPackages(pkgs);

        List<ShipmentHistoryDto> hist = historyRepository.findAllByShipmentIdOrderByChangeTimestampAsc(s.getId()).stream()
                .map(this::toHistoryDto).collect(Collectors.toList());
        res.setHistory(hist);

        return res;
    }

    private AddressDto toAddressDto(Address a) {
        if (a == null) return null;
        AddressDto dto = new AddressDto();
        dto.setId(a.getId());
        dto.setLine1(a.getLine1());
        dto.setLine2(a.getLine2());
        dto.setCity(a.getCity());
        dto.setState(a.getState());
        dto.setCountry(a.getCountry());
        dto.setPostalCode(a.getPostalCode());
        dto.setLatitude(a.getLatitude());
        dto.setLongitude(a.getLongitude());
        dto.setContactName(a.getContactName());
        dto.setContactPhone(a.getContactPhone());
        dto.setDeliveryInstructions(a.getDeliveryInstructions());
        return dto;
    }

    private ShipmentPackageDto toPackageDto(ShipmentPackage p) {
        ShipmentPackageDto dto = new ShipmentPackageDto();
        dto.setId(p.getId());
        dto.setDescription(p.getDescription());
        dto.setWeightKg(p.getWeightKg());
        dto.setLengthCm(p.getLengthCm());
        dto.setWidthCm(p.getWidthCm());
        dto.setHeightCm(p.getHeightCm());
        return dto;
    }

    private ShipmentHistoryDto toHistoryDto(ShipmentHistory h) {
        ShipmentHistoryDto dto = new ShipmentHistoryDto();
        dto.setId(h.getId());
        dto.setPreviousStatus(h.getPreviousStatus());
        dto.setNewStatus(h.getNewStatus());
        dto.setChangedBy(h.getChangedBy() != null ? h.getChangedBy().getId() : null);
        dto.setChangeTimestamp(h.getChangeTimestamp());
        dto.setLocation(h.getLocation());
        dto.setNote(h.getNote());
        return dto;
    }
}
