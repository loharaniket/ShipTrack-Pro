package com.shiptrackpro.backend.tracking;

import com.shiptrackpro.backend.delivery.service.DeliveryService;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.pod.dto.PodResponse;
import com.shiptrackpro.backend.pod.service.PodService;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.tracking.controller.LiveTrackingController;
import com.shiptrackpro.backend.tracking.dto.ActiveDriverTrackingDto;
import com.shiptrackpro.backend.tracking.dto.DriverLocationDto;
import com.shiptrackpro.backend.tracking.dto.StartTrackingRequest;
import com.shiptrackpro.backend.tracking.dto.UpdateLocationRequest;
import com.shiptrackpro.backend.tracking.entity.TrackingStatus;
import com.shiptrackpro.backend.tracking.service.LiveTrackingService;
import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.user.entity.Role;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.entity.UserStatus;
import com.shiptrackpro.backend.user.repository.RoleRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
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
public class LiveTrackingEndToEndIntegrationTest {

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private LiveTrackingService liveTrackingService;

    @Autowired
    private LiveTrackingController liveTrackingController;

    @Autowired
    private PodService podService;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    private User admin;
    private User driver;
    private User customer1;
    private User customer2;

    private CustomUserDetails adminDetails;
    private CustomUserDetails driverDetails;
    private CustomUserDetails customer1Details;
    private CustomUserDetails customer2Details;

    @BeforeEach
    void setUp() {
        Role adminRole = roleRepository.findByName(RoleName.ADMINISTRATOR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ADMINISTRATOR).description("Admin").build()));
        Role driverRole = roleRepository.findByName(RoleName.DRIVER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.DRIVER).description("Driver").build()));
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.CUSTOMER).description("Customer").build()));

        admin = userRepository.save(User.builder()
                .email("e2e_admin_" + UUID.randomUUID() + "@shiptrack.com")
                .passwordHash(passwordEncoder.encode("secret"))
                .firstName("Admin")
                .lastName("Chief")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(adminRole))
                .build());

        driver = userRepository.save(User.builder()
                .email("e2e_driver_" + UUID.randomUUID() + "@shiptrack.com")
                .passwordHash(passwordEncoder.encode("secret"))
                .firstName("Courier")
                .lastName("Express")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(driverRole))
                .build());

        customer1 = userRepository.save(User.builder()
                .email("e2e_cust1_" + UUID.randomUUID() + "@client.com")
                .passwordHash(passwordEncoder.encode("secret"))
                .firstName("Alice")
                .lastName("Wonder")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(customerRole))
                .build());

        customer2 = userRepository.save(User.builder()
                .email("e2e_cust2_" + UUID.randomUUID() + "@client.com")
                .passwordHash(passwordEncoder.encode("secret"))
                .firstName("Bob")
                .lastName("Builder")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(customerRole))
                .build());

        adminDetails = new CustomUserDetails(admin);
        driverDetails = new CustomUserDetails(driver);
        customer1Details = new CustomUserDetails(customer1);
        customer2Details = new CustomUserDetails(customer2);
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
    void testCompleteLiveDriverTrackingLifecycle() {
        // STEP 1: Customer 1 creates shipment A
        authenticateAs(customer1Details);
        CreateShipmentRequest createReqA = CreateShipmentRequest.builder()
                .senderName("Alice Sender")
                .senderPhone("+919876543210")
                .receiverName("Charlie Receiver")
                .receiverPhone("+919876543211")
                .pickupAddress("Bandra Kurla Complex, Mumbai")
                .deliveryAddress("Viman Nagar, Pune")
                .packageDescription("Electronics Package")
                .weight(2.5)
                .build();

        CreateShipmentResponse shipmentRespA = shipmentService.createShipment(createReqA, customer1);
        UUID shipmentIdA = shipmentRespA.getId();
        assertThat(shipmentRespA.getStatus()).isEqualTo("CREATED");

        // Also create shipment B for subsequent test
        CreateShipmentRequest createReqB = CreateShipmentRequest.builder()
                .senderName("Alice Sender")
                .senderPhone("+919876543210")
                .receiverName("David Receiver")
                .receiverPhone("+919876543212")
                .pickupAddress("Andheri East, Mumbai")
                .deliveryAddress("Kothrud, Pune")
                .packageDescription("Document Pouch")
                .weight(0.5)
                .build();
        CreateShipmentResponse shipmentRespB = shipmentService.createShipment(createReqB, customer1);
        UUID shipmentIdB = shipmentRespB.getId();

        entityManager.flush();

        // STEP 2: Admin assigns Driver to both shipment A and shipment B
        authenticateAs(adminDetails);
        deliveryService.assignShipment(shipmentIdA, driver.getId());
        deliveryService.assignShipment(shipmentIdB, driver.getId());
        entityManager.flush();

        Shipment assignedShipmentA = shipmentRepository.findById(shipmentIdA).orElseThrow();
        assertThat(assignedShipmentA.getStatus()).isEqualTo(ShipmentStatus.ASSIGNED);

        // STEP 3: Driver starts live delivery session for Shipment A
        authenticateAs(driverDetails);
        StartTrackingRequest startReq = StartTrackingRequest.builder()
                .shipmentId(shipmentIdA)
                .build();

        ResponseEntity<ApiResponse<DriverLocationDto>> startResp = liveTrackingController.startTracking(startReq, driverDetails);
        assertThat(startResp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(startResp.getBody().getData().getStatus()).isEqualTo(TrackingStatus.ACTIVE);

        // Verify shipment transitioned to OUT_FOR_DELIVERY
        Shipment outForDeliveryShipmentA = shipmentRepository.findById(shipmentIdA).orElseThrow();
        assertThat(outForDeliveryShipmentA.getStatus()).isEqualTo(ShipmentStatus.OUT_FOR_DELIVERY);

        // STEP 4: Rule Enforcement - Driver cannot start Shipment B while Shipment A is ACTIVE
        ResponseStatusException conflictEx = assertThrows(ResponseStatusException.class, () ->
                liveTrackingService.startTracking(StartTrackingRequest.builder().shipmentId(shipmentIdB).build(), driver));
        assertThat(conflictEx.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(conflictEx.getReason()).contains("Driver already has an active delivery session.");

        // STEP 5: Driver streams GPS coordinates
        UpdateLocationRequest locPing1 = UpdateLocationRequest.builder()
                .shipmentId(shipmentIdA)
                .latitude(new BigDecimal("18.5204300"))
                .longitude(new BigDecimal("73.8567400"))
                .accuracy(new BigDecimal("5.00"))
                .build();

        ResponseEntity<ApiResponse<DriverLocationDto>> locResp1 = liveTrackingController.updateLocation(locPing1, driverDetails);
        assertThat(locResp1.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(locResp1.getBody().getData().getLatitude()).isEqualByComparingTo(new BigDecimal("18.5204300"));

        // STEP 6: Admin views active fleet roster
        authenticateAs(adminDetails);
        ResponseEntity<ApiResponse<List<ActiveDriverTrackingDto>>> fleetResp = liveTrackingController.getActiveDrivers();
        assertThat(fleetResp.getBody().getData()).isNotEmpty();
        assertThat(fleetResp.getBody().getData().stream()
                .anyMatch(d -> d.getDriverId().equals(driver.getId()) && d.getShipmentId().equals(shipmentIdA))).isTrue();

        // STEP 7: Customer 1 (Shipment Owner) tracks live coordinates
        authenticateAs(customer1Details);
        ResponseEntity<ApiResponse<DriverLocationDto>> custTrackingResp = liveTrackingController.getShipmentLiveLocation(shipmentIdA, customer1Details);
        assertThat(custTrackingResp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(custTrackingResp.getBody().getData().getLatitude()).isEqualByComparingTo(new BigDecimal("18.5204300"));

        // Customer 2 (Unrelated customer) is Forbidden
        authenticateAs(customer2Details);
        assertThrows(ResponseStatusException.class, () ->
                liveTrackingController.getShipmentLiveLocation(shipmentIdA, customer2Details));

        // STEP 8: Driver delivers package and uploads Proof of Delivery (POD)
        authenticateAs(driverDetails);
        MockMultipartFile podPhoto = new MockMultipartFile(
                "photo", "pod_delivery_receipt.jpg", "image/jpeg", "fake signature photo".getBytes());

        PodResponse podResult = podService.uploadPod(shipmentIdA, "Charlie Receiver", podPhoto, driver);
        assertThat(podResult).isNotNull();
        assertThat(podResult.getReceiverName()).isEqualTo("Charlie Receiver");

        entityManager.flush();

        // STEP 9: Verify shipment is DELIVERED and active tracking session is auto-completed
        Shipment finalShipmentA = shipmentRepository.findById(shipmentIdA).orElseThrow();
        assertThat(finalShipmentA.getStatus()).isEqualTo(ShipmentStatus.DELIVERED);

        DriverLocationDto finalLocationA = liveTrackingService.getShipmentLiveLocation(shipmentIdA, customer1);
        assertThat(finalLocationA.getStatus()).isEqualTo(TrackingStatus.COMPLETED);
        assertThat(finalLocationA.getEndedReason()).isEqualTo("DELIVERED");

        // STEP 10: Now Driver is free to start tracking Shipment B!
        StartTrackingRequest startReqB = StartTrackingRequest.builder()
                .shipmentId(shipmentIdB)
                .build();
        ResponseEntity<ApiResponse<DriverLocationDto>> startRespB = liveTrackingController.startTracking(startReqB, driverDetails);
        assertThat(startRespB.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(startRespB.getBody().getData().getShipmentId()).isEqualTo(shipmentIdB);
        assertThat(startRespB.getBody().getData().getStatus()).isEqualTo(TrackingStatus.ACTIVE);
    }
}
