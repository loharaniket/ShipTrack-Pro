package com.shiptrackpro.backend.tracking;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.delivery.entity.DeliveryAssignment;
import com.shiptrackpro.backend.delivery.repository.DeliveryAssignmentRepository;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.tracking.controller.LiveTrackingController;
import com.shiptrackpro.backend.tracking.dto.ActiveDriverTrackingDto;
import com.shiptrackpro.backend.tracking.dto.DriverLocationDto;
import com.shiptrackpro.backend.tracking.dto.StartTrackingRequest;
import com.shiptrackpro.backend.tracking.dto.UpdateLocationRequest;
import com.shiptrackpro.backend.user.entity.Role;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.entity.UserStatus;
import com.shiptrackpro.backend.user.repository.RoleRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
public class LiveTrackingControllerTest {

    @Autowired
    private LiveTrackingController liveTrackingController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private DeliveryAssignmentRepository deliveryAssignmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User driver;
    private User customerA;
    private User customerB;
    private User admin;
    private Shipment shipment;

    private CustomUserDetails driverDetails;
    private CustomUserDetails customerADetails;
    private CustomUserDetails customerBDetails;
    private CustomUserDetails adminDetails;

    @BeforeEach
    void setUp() {
        Role driverRole = roleRepository.findByName(RoleName.DRIVER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.DRIVER).description("Driver").build()));
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.CUSTOMER).description("Customer").build()));
        Role adminRole = roleRepository.findByName(RoleName.ADMINISTRATOR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ADMINISTRATOR).description("Admin").build()));

        driver = userRepository.save(User.builder()
                .email("api_driver_" + UUID.randomUUID() + "@shiptrack.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .firstName("Driver")
                .lastName("Api")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(driverRole))
                .build());

        customerA = userRepository.save(User.builder()
                .email("api_custA_" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .firstName("Alice")
                .lastName("Api")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(customerRole))
                .build());

        customerB = userRepository.save(User.builder()
                .email("api_custB_" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .firstName("Bob")
                .lastName("Api")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(customerRole))
                .build());

        admin = userRepository.save(User.builder()
                .email("api_admin_" + UUID.randomUUID() + "@shiptrack.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .firstName("Admin")
                .lastName("Api")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(adminRole))
                .build());

        shipment = shipmentRepository.save(Shipment.builder()
                .trackingNumber("STP" + System.currentTimeMillis())
                .customer(customerA)
                .senderName("Sender Api")
                .senderPhone("+919999999901")
                .receiverName("Receiver Api")
                .receiverPhone("+919999999902")
                .pickupAddress("Pickup Mumbai")
                .deliveryAddress("Delivery Pune")
                .packageDescription("Api Parcel")
                .weight(1.5)
                .status(ShipmentStatus.ASSIGNED)
                .build());

        deliveryAssignmentRepository.save(DeliveryAssignment.builder()
                .shipment(shipment)
                .driver(driver)
                .status("ASSIGNED")
                .build());

        driverDetails = new CustomUserDetails(driver);
        customerADetails = new CustomUserDetails(customerA);
        customerBDetails = new CustomUserDetails(customerB);
        adminDetails = new CustomUserDetails(admin);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(CustomUserDetails userDetails) {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testStartTrackingController_Success() {
        authenticateAs(driverDetails);

        StartTrackingRequest req = StartTrackingRequest.builder()
                .shipmentId(shipment.getId())
                .build();

        ResponseEntity<ApiResponse<DriverLocationDto>> response = liveTrackingController.startTracking(req, driverDetails);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData().getShipmentId()).isEqualTo(shipment.getId());
        assertThat(response.getBody().getData().getStatus().name()).isEqualTo("ACTIVE");
    }

    @Test
    void testUpdateLocationController_Success() {
        authenticateAs(driverDetails);

        // Start tracking first
        liveTrackingController.startTracking(StartTrackingRequest.builder().shipmentId(shipment.getId()).build(), driverDetails);

        UpdateLocationRequest updateReq = UpdateLocationRequest.builder()
                .shipmentId(shipment.getId())
                .latitude(new BigDecimal("18.5204300"))
                .longitude(new BigDecimal("73.8567400"))
                .accuracy(new BigDecimal("6.00"))
                .build();

        ResponseEntity<ApiResponse<DriverLocationDto>> response = liveTrackingController.updateLocation(updateReq, driverDetails);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getLatitude()).isEqualByComparingTo(new BigDecimal("18.5204300"));
    }

    @Test
    void testStopTrackingController_Success() {
        authenticateAs(driverDetails);

        liveTrackingController.startTracking(StartTrackingRequest.builder().shipmentId(shipment.getId()).build(), driverDetails);

        ResponseEntity<ApiResponse<DriverLocationDto>> response = liveTrackingController.stopTracking(shipment.getId(), "DELIVERED", driverDetails);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getStatus().name()).isEqualTo("COMPLETED");
        assertThat(response.getBody().getData().getEndedReason()).isEqualTo("DELIVERED");
    }

    @Test
    void testGetShipmentLiveLocationController_CustomerAndAdminAccess() {
        authenticateAs(driverDetails);
        liveTrackingController.startTracking(StartTrackingRequest.builder().shipmentId(shipment.getId()).build(), driverDetails);

        // Customer A (Owner) -> Success
        authenticateAs(customerADetails);
        ResponseEntity<ApiResponse<DriverLocationDto>> custResponse = liveTrackingController.getShipmentLiveLocation(shipment.getId(), customerADetails);
        assertThat(custResponse.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(custResponse.getBody().getData().getShipmentId()).isEqualTo(shipment.getId());

        // Admin -> Success
        authenticateAs(adminDetails);
        ResponseEntity<ApiResponse<DriverLocationDto>> adminResponse = liveTrackingController.getShipmentLiveLocation(shipment.getId(), adminDetails);
        assertThat(adminResponse.getStatusCode().is2xxSuccessful()).isTrue();

        // Customer B (Unrelated) -> Forbidden
        authenticateAs(customerBDetails);
        assertThrows(ResponseStatusException.class, () ->
                liveTrackingController.getShipmentLiveLocation(shipment.getId(), customerBDetails));
    }

    @Test
    void testGetActiveDriversController_Success() {
        authenticateAs(driverDetails);
        liveTrackingController.startTracking(StartTrackingRequest.builder().shipmentId(shipment.getId()).build(), driverDetails);

        authenticateAs(adminDetails);
        ResponseEntity<ApiResponse<List<ActiveDriverTrackingDto>>> response = liveTrackingController.getActiveDrivers();

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isNotEmpty();
        assertThat(response.getBody().getData().stream().anyMatch(d -> d.getDriverId().equals(driver.getId()))).isTrue();
    }
}
