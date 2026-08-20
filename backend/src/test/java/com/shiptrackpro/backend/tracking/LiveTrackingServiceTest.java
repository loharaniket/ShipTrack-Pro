package com.shiptrackpro.backend.tracking;

import com.shiptrackpro.backend.delivery.entity.DeliveryAssignment;
import com.shiptrackpro.backend.delivery.repository.DeliveryAssignmentRepository;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.tracking.dto.ActiveDriverTrackingDto;
import com.shiptrackpro.backend.tracking.dto.DriverLocationDto;
import com.shiptrackpro.backend.tracking.dto.StartTrackingRequest;
import com.shiptrackpro.backend.tracking.dto.UpdateLocationRequest;
import com.shiptrackpro.backend.tracking.entity.TrackingConnectionStatus;
import com.shiptrackpro.backend.tracking.entity.TrackingStatus;
import com.shiptrackpro.backend.tracking.service.LiveTrackingService;
import com.shiptrackpro.backend.user.entity.Role;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.entity.UserStatus;
import com.shiptrackpro.backend.user.repository.RoleRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
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
public class LiveTrackingServiceTest {

    @Autowired
    private LiveTrackingService liveTrackingService;

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

    @PersistenceContext
    private EntityManager entityManager;

    private User driver1;
    private User driver2;
    private User customerA;
    private User customerB;
    private User admin;
    private Shipment shipment1;
    private Shipment shipment2;

    @BeforeEach
    void setUp() {
        Role driverRole = roleRepository.findByName(RoleName.DRIVER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.DRIVER).description("Driver").build()));
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.CUSTOMER).description("Customer").build()));
        Role adminRole = roleRepository.findByName(RoleName.ADMINISTRATOR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ADMINISTRATOR).description("Admin").build()));

        driver1 = userRepository.save(User.builder()
                .email("driver_live1_" + UUID.randomUUID() + "@shiptrack.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .firstName("Ramesh")
                .lastName("Powar")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(driverRole))
                .build());

        driver2 = userRepository.save(User.builder()
                .email("driver_live2_" + UUID.randomUUID() + "@shiptrack.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .firstName("Suresh")
                .lastName("Raina")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(driverRole))
                .build());

        customerA = userRepository.save(User.builder()
                .email("customer_liveA_" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .firstName("Alice")
                .lastName("Smith")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(customerRole))
                .build());

        customerB = userRepository.save(User.builder()
                .email("customer_liveB_" + UUID.randomUUID() + "@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .firstName("Bob")
                .lastName("Jones")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(customerRole))
                .build());

        admin = userRepository.save(User.builder()
                .email("admin_live_" + UUID.randomUUID() + "@shiptrack.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .firstName("Admin")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(adminRole))
                .build());

        shipment1 = shipmentRepository.save(Shipment.builder()
                .trackingNumber("STP" + System.currentTimeMillis())
                .customer(customerA)
                .senderName("Sender A")
                .senderPhone("+919999999901")
                .receiverName("Receiver A")
                .receiverPhone("+919999999902")
                .pickupAddress("Bandra, Mumbai")
                .deliveryAddress("Viman Nagar, Pune")
                .packageDescription("Laptop Box")
                .weight(2.0)
                .status(ShipmentStatus.ASSIGNED)
                .build());

        shipment2 = shipmentRepository.save(Shipment.builder()
                .trackingNumber("STP" + (System.currentTimeMillis() + 50))
                .customer(customerB)
                .senderName("Sender B")
                .senderPhone("+919999999903")
                .receiverName("Receiver B")
                .receiverPhone("+919999999904")
                .pickupAddress("Andheri, Mumbai")
                .deliveryAddress("Hinjawadi, Pune")
                .packageDescription("Document Bag")
                .weight(0.5)
                .status(ShipmentStatus.ASSIGNED)
                .build());

        // Assign shipment1 to driver1, shipment2 to driver1 as well (multiple assigned, but only one active OUT_FOR_DELIVERY at a time)
        deliveryAssignmentRepository.save(DeliveryAssignment.builder()
                .shipment(shipment1)
                .driver(driver1)
                .status("ASSIGNED")
                .build());

        deliveryAssignmentRepository.save(DeliveryAssignment.builder()
                .shipment(shipment2)
                .driver(driver1)
                .status("ASSIGNED")
                .build());

        entityManager.flush();
    }

    @Test
    void testStartTracking_Success() {
        StartTrackingRequest req = StartTrackingRequest.builder()
                .shipmentId(shipment1.getId())
                .build();

        DriverLocationDto dto = liveTrackingService.startTracking(req, driver1);
        entityManager.flush();

        assertThat(dto).isNotNull();
        assertThat(dto.getShipmentId()).isEqualTo(shipment1.getId());
        assertThat(dto.getDriverId()).isEqualTo(driver1.getId());
        assertThat(dto.getStatus()).isEqualTo(TrackingStatus.ACTIVE);
        assertThat(dto.getConnectionStatus()).isEqualTo(TrackingConnectionStatus.CONNECTED);
        assertThat(dto.getStartedAt()).isNotNull();

        Shipment updatedShipment = shipmentRepository.findById(shipment1.getId()).orElseThrow();
        assertThat(updatedShipment.getStatus()).isEqualTo(ShipmentStatus.OUT_FOR_DELIVERY);
    }

    @Test
    void testStartTracking_DuplicateActiveSession_ThrowsConflict() {
        // Start tracking for shipment 1
        liveTrackingService.startTracking(StartTrackingRequest.builder().shipmentId(shipment1.getId()).build(), driver1);
        entityManager.flush();

        // Attempt to start tracking for shipment 2 while shipment 1 is still ACTIVE
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                liveTrackingService.startTracking(StartTrackingRequest.builder().shipmentId(shipment2.getId()).build(), driver1));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(ex.getReason()).contains("Driver already has an active delivery session.");
    }

    @Test
    void testStartTracking_UnauthorizedDriver_ThrowsForbidden() {
        // Driver 2 is NOT assigned to shipment 1
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                liveTrackingService.startTracking(StartTrackingRequest.builder().shipmentId(shipment1.getId()).build(), driver2));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(ex.getReason()).contains("You are not assigned to deliver this shipment");
    }

    @Test
    void testUpdateLocation_Success() {
        liveTrackingService.startTracking(StartTrackingRequest.builder().shipmentId(shipment1.getId()).build(), driver1);
        entityManager.flush();

        UpdateLocationRequest updateReq = UpdateLocationRequest.builder()
                .shipmentId(shipment1.getId())
                .latitude(new BigDecimal("18.5204300"))
                .longitude(new BigDecimal("73.8567400"))
                .accuracy(new BigDecimal("5.50"))
                .build();

        DriverLocationDto updated = liveTrackingService.updateLocation(updateReq, driver1);
        entityManager.flush();

        assertThat(updated.getLatitude()).isEqualByComparingTo(new BigDecimal("18.5204300"));
        assertThat(updated.getLongitude()).isEqualByComparingTo(new BigDecimal("73.8567400"));
        assertThat(updated.getAccuracy()).isEqualByComparingTo(new BigDecimal("5.50"));
        assertThat(updated.getLastPingAt()).isNotNull();
    }

    @Test
    void testUpdateLocation_UnauthorizedDriver_ThrowsForbidden() {
        liveTrackingService.startTracking(StartTrackingRequest.builder().shipmentId(shipment1.getId()).build(), driver1);
        entityManager.flush();

        UpdateLocationRequest updateReq = UpdateLocationRequest.builder()
                .shipmentId(shipment1.getId())
                .latitude(new BigDecimal("18.5204300"))
                .longitude(new BigDecimal("73.8567400"))
                .accuracy(new BigDecimal("5.50"))
                .build();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                liveTrackingService.updateLocation(updateReq, driver2));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void testStopTracking_Success() {
        liveTrackingService.startTracking(StartTrackingRequest.builder().shipmentId(shipment1.getId()).build(), driver1);
        entityManager.flush();

        DriverLocationDto completed = liveTrackingService.stopTracking(shipment1.getId(), "DELIVERED", driver1);
        entityManager.flush();

        assertThat(completed.getStatus()).isEqualTo(TrackingStatus.COMPLETED);
        assertThat(completed.getEndedReason()).isEqualTo("DELIVERED");
        assertThat(completed.getEndedAt()).isNotNull();

        // Now driver1 can start shipment2
        DriverLocationDto session2 = liveTrackingService.startTracking(StartTrackingRequest.builder().shipmentId(shipment2.getId()).build(), driver1);
        assertThat(session2).isNotNull();
        assertThat(session2.getStatus()).isEqualTo(TrackingStatus.ACTIVE);
    }

    @Test
    void testGetShipmentLiveLocation_CustomerAndAdminAccess() {
        liveTrackingService.startTracking(StartTrackingRequest.builder().shipmentId(shipment1.getId()).build(), driver1);
        entityManager.flush();

        // Customer A (Owner) can access
        DriverLocationDto custLocation = liveTrackingService.getShipmentLiveLocation(shipment1.getId(), customerA);
        assertThat(custLocation).isNotNull();
        assertThat(custLocation.getShipmentId()).isEqualTo(shipment1.getId());

        // Admin can access
        DriverLocationDto adminLocation = liveTrackingService.getShipmentLiveLocation(shipment1.getId(), admin);
        assertThat(adminLocation).isNotNull();

        // Customer B (Unrelated customer) is Forbidden
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                liveTrackingService.getShipmentLiveLocation(shipment1.getId(), customerB));
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void testGetActiveDrivers() {
        liveTrackingService.startTracking(StartTrackingRequest.builder().shipmentId(shipment1.getId()).build(), driver1);
        entityManager.flush();

        List<ActiveDriverTrackingDto> activeDrivers = liveTrackingService.getActiveDrivers();
        assertThat(activeDrivers).isNotEmpty();
        assertThat(activeDrivers.stream().anyMatch(d -> d.getDriverId().equals(driver1.getId()) && d.getShipmentId().equals(shipment1.getId()))).isTrue();
    }
}
