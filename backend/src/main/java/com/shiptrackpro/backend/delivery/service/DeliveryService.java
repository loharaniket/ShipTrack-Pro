package com.shiptrackpro.backend.delivery.service;

import com.shiptrackpro.backend.delivery.dto.*;
import com.shiptrackpro.backend.delivery.entity.Driver;
import com.shiptrackpro.backend.delivery.entity.DriverLocation;
import com.shiptrackpro.backend.delivery.entity.ShipmentAssignment;
import com.shiptrackpro.backend.delivery.entity.Vehicle;
import com.shiptrackpro.backend.delivery.repository.DriverLocationRepository;
import com.shiptrackpro.backend.delivery.repository.DriverRepository;
import com.shiptrackpro.backend.delivery.repository.ShipmentAssignmentRepository;
import com.shiptrackpro.backend.delivery.repository.VehicleRepository;
import com.shiptrackpro.backend.organization.entity.Organization;
import com.shiptrackpro.backend.organization.entity.OrganizationMember;
import com.shiptrackpro.backend.organization.entity.OrganizationStatus;
import com.shiptrackpro.backend.organization.repository.OrganizationMemberRepository;
import com.shiptrackpro.backend.organization.repository.OrganizationRepository;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.user.entity.Role;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.entity.UserStatus;
import com.shiptrackpro.backend.user.repository.RoleRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final ShipmentAssignmentRepository assignmentRepository;
    private final DriverLocationRepository locationRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    private boolean isAdministrator(User user) {
        return user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ADMINISTRATOR);
    }

    private Organization getUserOrganization(User user) {
        List<OrganizationMember> members = organizationMemberRepository.findByUserId(user.getId());
        if (members.isEmpty()) {
            String orgCode = "ORG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Organization org = Organization.builder()
                    .name(user.getFirstName() + "'s Organization")
                    .code(orgCode)
                    .status(OrganizationStatus.ACTIVE)
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

    public List<DriverDto> getDrivers(User user) {
        boolean isAdmin = isAdministrator(user);
        List<Driver> drivers;
        if (isAdmin) {
            drivers = driverRepository.findAll();
        } else {
            UUID orgId = getUserOrganization(user).getId();
            drivers = driverRepository.findAllByOrganizationId(orgId);
        }
        return drivers.stream().map(this::toDriverDto).collect(Collectors.toList());
    }

    public List<VehicleDto> getVehicles(User user) {
        boolean isAdmin = isAdministrator(user);
        List<Vehicle> vehicles;
        if (isAdmin) {
            vehicles = vehicleRepository.findAll();
        } else {
            UUID orgId = getUserOrganization(user).getId();
            vehicles = vehicleRepository.findAllByOrganizationId(orgId);
        }
        return vehicles.stream().map(this::toVehicleDto).collect(Collectors.toList());
    }

    @Transactional
    public DriverDto createDriver(CreateDriverRequest request, User authUser) {
        Organization org = getUserOrganization(authUser);

        // Find or create User
        User driverUser = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (driverUser == null) {
            String[] names = request.getName().trim().split("\\s+", 2);
            String firstName = names[0];
            String lastName = names.length > 1 ? names[1] : "";

            Role driverRole = roleRepository.findByName(RoleName.DRIVER)
                    .orElseGet(() -> {
                        Role r = new Role();
                        r.setName(RoleName.DRIVER);
                        r.setDescription("Driver role");
                        return roleRepository.save(r);
                    });

            Set<Role> roles = new HashSet<>();
            roles.add(driverRole);

            driverUser = User.builder()
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode("Driver@123"))
                    .firstName(firstName)
                    .lastName(lastName)
                    .phone(request.getPhone())
                    .status(UserStatus.ACTIVE)
                    .roles(roles)
                    .build();

            driverUser = userRepository.save(driverUser);

            OrganizationMember member = OrganizationMember.builder()
                    .organization(org)
                    .user(driverUser)
                    .build();
            organizationMemberRepository.save(member);
        }

        // Vehicle
        Vehicle vehicle = null;
        if (request.getVehicleRegistration() != null && !request.getVehicleRegistration().isBlank()) {
            vehicle = vehicleRepository.findByRegistrationNumber(request.getVehicleRegistration())
                    .orElseGet(() -> {
                        Vehicle v = Vehicle.builder()
                                .organization(org)
                                .registrationNumber(request.getVehicleRegistration())
                                .licensePlate(request.getVehicleRegistration())
                                .type(request.getVehicleType() != null ? request.getVehicleType() : "Van")
                                .capacityKg(request.getVehicleCapacityKg() != null ? request.getVehicleCapacityKg() : 500.0)
                                .status("Active")
                                .build();
                        return vehicleRepository.save(v);
                    });
        }

        // Check if driver profile already exists
        Driver driver = driverRepository.findByUserId(driverUser.getId()).orElse(null);
        if (driver == null) {
            driver = Driver.builder()
                    .user(driverUser)
                    .organization(org)
                    .vehicle(vehicle)
                    .licenseNumber(request.getLicenseNumber() != null ? request.getLicenseNumber() : "LIC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 1)
                    .status(request.getStatus() != null ? request.getStatus() : "Active")
                    .build();
        } else {
            if (vehicle != null) driver.setVehicle(vehicle);
            if (request.getStatus() != null) driver.setStatus(request.getStatus());
        }

        Driver savedDriver = driverRepository.save(driver);
        return toDriverDto(savedDriver);
    }

    public DriverDto getDriverProfile(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Driver profile not found"));

        return toDriverDto(driver);
    }

    public List<AssignmentDto> getDriverAssignments(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
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

        User adminUser = userRepository.findByEmail(auth.getName())
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
                .lat(location.getLatitude())
                .lng(location.getLongitude())
                .speed(0.0)
                .build();
    }

    private DriverDto toDriverDto(Driver driver) {
        User u = driver.getUser();
        String name = u != null ? (u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim() : "Unknown";
        String email = u != null ? u.getEmail() : "";
        String phone = u != null ? u.getPhone() : "";

        VehicleDto vehicleDto = driver.getVehicle() != null ? toVehicleDto(driver.getVehicle()) : null;

        return DriverDto.builder()
                .id(driver.getId())
                .name(name)
                .email(email)
                .phone(phone)
                .status(driver.getStatus())
                .vehicleId(driver.getVehicle() != null ? driver.getVehicle().getId() : null)
                .vehicle(vehicleDto)
                .licenseNumber(driver.getLicenseNumber())
                .experienceYears(driver.getExperienceYears())
                .createdAt(driver.getCreatedAt())
                .build();
    }

    private VehicleDto toVehicleDto(Vehicle v) {
        return VehicleDto.builder()
                .id(v.getId())
                .registrationNumber(v.getRegistrationNumber())
                .type(v.getType())
                .capacityKg(v.getCapacityKg())
                .status(v.getStatus())
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
