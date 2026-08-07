package com.shiptrackpro.backend.shipment.service;

import com.shiptrackpro.backend.shipment.dto.*;
import com.shiptrackpro.backend.shipment.entity.Package;
import com.shiptrackpro.backend.shipment.entity.*;
import com.shiptrackpro.backend.shipment.repository.*;
import com.shiptrackpro.backend.user.entity.AppRole;
import com.shiptrackpro.backend.user.entity.AppUser;
import com.shiptrackpro.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final AddressRepository addressRepository;
    private final PackageRepository packageRepository;
    private final ShipmentHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public ShipmentDto createShipment(CreateShipmentRequest request, Authentication auth) {
        AppUser user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 1. Create Addresses
        Address senderAddress = saveAddress(request.getSenderAddress());
        Address receiverAddress = saveAddress(request.getReceiverAddress());

        // 2. Create Shipment
        Shipment shipment = new Shipment();
        shipment.setTrackingNumber(generateTrackingNumber());
        shipment.setSenderName(request.getSenderName());
        shipment.setSenderPhone(request.getSenderPhone());
        shipment.setSenderAddress(senderAddress);
        shipment.setReceiverName(request.getReceiverName());
        shipment.setReceiverPhone(request.getReceiverPhone());
        shipment.setReceiverAddress(receiverAddress);
        shipment.setPriority(request.getPriority() != null ? request.getPriority() : ShipmentPriority.NORMAL);
        shipment.setCreatedBy(user);

        if (user.getRole() == AppRole.BUSINESS_CLIENT && user.getCompany() != null) {
            shipment.setCompany(user.getCompany());
        }

        Shipment savedShipment = shipmentRepository.save(shipment);

        // 3. Create Packages
        if (request.getPackages() != null) {
            for (PackageDto pkgDto : request.getPackages()) {
                Package pkg = new Package();
                pkg.setShipment(savedShipment);
                pkg.setWeightKg(pkgDto.getWeightKg());
                pkg.setDimensionsCm(pkgDto.getDimensionsCm());
                pkg.setContentDescription(pkgDto.getContentDescription());
                packageRepository.save(pkg);
            }
        }

        // 4. Log History
        logHistory(savedShipment, ShipmentStatus.CREATED, "Shipment created", user);

        return getShipmentById(savedShipment.getId(), auth);
    }

    public ShipmentDto getShipmentById(UUID id, Authentication auth) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));
        return toDto(shipment);
    }

    public Page<ShipmentSummaryDto> getAllShipments(Pageable pageable, Authentication auth) {
        AppUser user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == AppRole.BUSINESS_CLIENT && user.getCompany() != null) {
            return shipmentRepository.findAllByCompanyId(user.getCompany().getId(), pageable)
                    .map(this::toSummaryDto);
        } else if (user.getRole() == AppRole.CUSTOMER) {
            return shipmentRepository.findAllByCreatedById(user.getId(), pageable)
                    .map(this::toSummaryDto);
        }

        // Admin or Operator sees all
        return shipmentRepository.findAll(pageable).map(this::toSummaryDto);
    }

    public ShipmentDto updateShipment(UUID id, UpdateShipmentRequest request, Authentication auth) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));

        if (request.getReceiverName() != null)
            shipment.setReceiverName(request.getReceiverName());
        if (request.getReceiverPhone() != null)
            shipment.setReceiverPhone(request.getReceiverPhone());
        if (request.getPriority() != null)
            shipment.setPriority(request.getPriority());

        if (request.getReceiverAddress() != null) {
            Address newAddress = saveAddress(request.getReceiverAddress());
            shipment.setReceiverAddress(newAddress);
        }

        Shipment saved = shipmentRepository.save(shipment);
        return toDto(saved);
    }

    public void cancelShipment(UUID id, Authentication auth) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));

        AppUser user = userRepository.findByEmail(auth.getName()).orElse(null);

        shipment.setStatus(ShipmentStatus.CANCELLED);
        shipment.setDeletedAt(ZonedDateTime.now());
        shipmentRepository.save(shipment);

        logHistory(shipment, ShipmentStatus.CANCELLED, "Shipment cancelled by user", user);
    }

    public PackageDto addPackageToShipment(UUID shipmentId, PackageDto request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));

        Package pkg = new Package();
        pkg.setShipment(shipment);
        pkg.setWeightKg(request.getWeightKg());
        pkg.setDimensionsCm(request.getDimensionsCm());
        pkg.setContentDescription(request.getContentDescription());

        Package saved = packageRepository.save(pkg);
        return toPackageDto(saved);
    }

    public List<ShipmentHistoryDto> getShipmentHistory(UUID shipmentId) {
        List<ShipmentHistory> history = historyRepository.findAllByShipmentIdOrderByRecordedAtAsc(shipmentId);
        return history.stream().map(this::toHistoryDto).collect(Collectors.toList());
    }

    public void updateShipmentHistory(UUID id, ShipmentStatus status, Authentication auth) {
        var shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shipment Not Found!"));
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User Not Found!"));
        shipment.setStatus(status);
        shipmentRepository.save(shipment);
        logHistory(shipment, status, "Update by user", user);
    }

    // --- Helper Methods ---

    private void logHistory(Shipment shipment, ShipmentStatus status, String remarks, AppUser user) {
        ShipmentHistory history = new ShipmentHistory();
        history.setShipment(shipment);
        history.setStatus(status);
        history.setStatusRemarks(remarks);
        history.setChangedBy(user);
        historyRepository.save(history);
    }

    private Address saveAddress(AddressDto dto) {
        Address address = new Address();
        address.setLine1(dto.getLine1());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setCountry(dto.getCountry());
        address.setPostalCode(dto.getPostalCode());
        return addressRepository.save(address);
    }

    private String generateTrackingNumber() {
        return "STP-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private ShipmentSummaryDto toSummaryDto(Shipment s) {
        return ShipmentSummaryDto.builder()
                .id(s.getId())
                .trackingNumber(s.getTrackingNumber())
                .receiverName(s.getReceiverName())
                .receiverCity(s.getReceiverAddress().getCity())
                .status(s.getStatus())
                .priority(s.getPriority())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private ShipmentDto toDto(Shipment s) {
        var pkg = packageRepository.findByShipment(s).stream().map(this::toPackageDto).toList();
        return ShipmentDto.builder()
                .id(s.getId())
                .trackingNumber(s.getTrackingNumber())
                .companyId(s.getCompany() != null ? s.getCompany().getId() : null)
                .senderName(s.getSenderName())
                .senderPhone(s.getSenderPhone())
                .senderAddress(toAddressDto(s.getSenderAddress()))
                .receiverName(s.getReceiverName())
                .receiverPhone(s.getReceiverPhone())
                .receiverAddress(toAddressDto(s.getReceiverAddress()))
                .status(s.getStatus())
                .priority(s.getPriority())
                .estimatedDeliveryTime(s.getEstimatedDeliveryTime())
                .actualDeliveryDate(s.getActualDeliveryDate())
                .createdAt(s.getCreatedAt())
                .packages(pkg)
                .build();
    }

    private AddressDto toAddressDto(Address a) {
        if (a == null)
            return null;
        return AddressDto.builder()
                .id(a.getId())
                .line1(a.getLine1())
                .city(a.getCity())
                .state(a.getState())
                .country(a.getCountry())
                .postalCode(a.getPostalCode())
                .build();
    }

    private PackageDto toPackageDto(Package p) {
        return PackageDto.builder()
                .id(p.getId())
                .weightKg(p.getWeightKg())
                .dimensionsCm(p.getDimensionsCm())
                .contentDescription(p.getContentDescription())
                .build();
    }

    private ShipmentHistoryDto toHistoryDto(ShipmentHistory h) {
        return ShipmentHistoryDto.builder()
                .id(h.getId())
                .status(h.getStatus())
                .statusRemarks(h.getStatusRemarks())
                .changedById(h.getChangedBy() != null ? h.getChangedBy().getId() : null)
                .changedByName(h.getChangedBy() != null ? h.getChangedBy().getFirstName() : "System")
                .recordedAt(h.getRecordedAt())
                .build();
    }
}
