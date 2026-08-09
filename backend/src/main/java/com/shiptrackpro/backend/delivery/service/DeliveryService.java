package com.shiptrackpro.backend.delivery.service;

import com.shiptrackpro.backend.delivery.dto.*;
import com.shiptrackpro.backend.delivery.entity.AssignmentStatus;
import com.shiptrackpro.backend.delivery.entity.Driver;
import com.shiptrackpro.backend.delivery.entity.DriverLocation;
import com.shiptrackpro.backend.delivery.entity.ShipmentAssignment;
import com.shiptrackpro.backend.delivery.repository.*;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.user.entity.AppUser;
import com.shiptrackpro.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DriverRepository driverRepository;
    private final ShipmentAssignmentRepository assignmentRepository;
    private final DriverLocationRepository locationRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    public List<DriverDto> getDrivers() {
        return driverRepository.findAll().stream()
                .map(this::toDriverDto)
                .collect(Collectors.toList());
    }

    public DriverDto getDriverProfile(Authentication auth) {
        AppUser user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Driver profile not found"));
                
        return toDriverDto(driver);
    }

    public List<AssignmentDto> getDriverAssignments(Authentication auth) {
        AppUser user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Driver profile not found"));
                
        List<ShipmentAssignment> assignments = assignmentRepository.findAllByDriverId(driver.getId());
        
        return assignments.stream()
                .map(this::toAssignmentDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssignmentDto assignShipment(ShipmentAssignmentRequest request, Authentication auth) {
        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));

        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        AppUser adminUser = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        ShipmentAssignment assignment = new ShipmentAssignment();
        assignment.setShipment(shipment);
        assignment.setDriver(driver);
        assignment.setAssignedBy(adminUser);
        
        ShipmentAssignment savedAssignment = assignmentRepository.save(assignment);

        shipment.setStatus(ShipmentStatus.OUT_FOR_DELIVERY);
        shipmentRepository.save(shipment);

        return toAssignmentDto(savedAssignment);
    }

    public String updateDriverLocation(UUID driverId, LocationUpdateRequest request) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        DriverLocation location = new DriverLocation();
        location.setDriver(driver);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());

        locationRepository.save(location);

        return "Location updated successfully";
    }

    public DriverLocationDto getLatestDriverLocation(UUID driverId) {
        DriverLocation location = locationRepository.findFirstByDriverIdOrderByRecordedAtDesc(driverId)
                .orElseThrow(() -> new IllegalArgumentException("No location found for this driver"));

        return DriverLocationDto.builder()
                .driverId(location.getDriver().getId())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .recordedAt(location.getRecordedAt())
                .build();
    }

    private DriverDto toDriverDto(Driver driver) {
        return DriverDto.builder()
                .id(driver.getId())
                .driverName(driver.getUser().getFirstName() + " " + driver.getUser().getLastName())
                .licenseNumber(driver.getLicenseNumber())
                .experienceYears(driver.getExperienceYears())
                .build();
    }

    private AssignmentDto toAssignmentDto(ShipmentAssignment assignment) {
        return AssignmentDto.builder()
                .id(assignment.getId())
                .shipmentId(assignment.getShipment().getId())
                .driverId(assignment.getDriver().getId())
                .status(assignment.getStatus())
                .assignedAt(assignment.getAssignedAt())
                .build();
    }
}
