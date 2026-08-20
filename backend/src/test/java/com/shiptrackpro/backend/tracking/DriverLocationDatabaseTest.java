package com.shiptrackpro.backend.tracking;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.tracking.entity.DriverLocation;
import com.shiptrackpro.backend.tracking.entity.TrackingConnectionStatus;
import com.shiptrackpro.backend.tracking.entity.TrackingStatus;
import com.shiptrackpro.backend.tracking.repository.DriverLocationRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class DriverLocationDatabaseTest {

    @Autowired
    private DriverLocationRepository driverLocationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    private User testDriver;
    private Shipment testShipment1;
    private Shipment testShipment2;

    @BeforeEach
    void setUp() {
        Role driverRole = roleRepository.findByName(RoleName.DRIVER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.DRIVER).description("Driver").build()));

        testDriver = userRepository.save(User.builder()
                .email("driver_db_test_" + UUID.randomUUID() + "@shiptrack.com")
                .passwordHash(passwordEncoder.encode("password"))
                .firstName("Mahesh")
                .lastName("Kumar")
                .phone("+919876543210")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(driverRole))
                .build());

        testShipment1 = shipmentRepository.save(Shipment.builder()
                .trackingNumber("STP" + System.currentTimeMillis())
                .senderName("Sender A")
                .senderPhone("+919999999991")
                .receiverName("Receiver A")
                .receiverPhone("+919999999992")
                .pickupAddress("Warehouse 1, Mumbai")
                .deliveryAddress("Tech Park, Pune")
                .packageDescription("Electronics Box")
                .weight(2.5)
                .status(ShipmentStatus.OUT_FOR_DELIVERY)
                .build());

        testShipment2 = shipmentRepository.save(Shipment.builder()
                .trackingNumber("STP" + (System.currentTimeMillis() + 100))
                .senderName("Sender B")
                .senderPhone("+919999999993")
                .receiverName("Receiver B")
                .receiverPhone("+919999999994")
                .pickupAddress("Warehouse 2, Mumbai")
                .deliveryAddress("Baner, Pune")
                .packageDescription("Apparel Pack")
                .weight(1.2)
                .status(ShipmentStatus.OUT_FOR_DELIVERY)
                .build());

        entityManager.flush();
    }

    @Test
    void testCreateAndFindActiveDriverLocation() {
        DriverLocation location = DriverLocation.builder()
                .driver(testDriver)
                .shipment(testShipment1)
                .latitude(new BigDecimal("18.5204303"))
                .longitude(new BigDecimal("73.8567437"))
                .accuracy(new BigDecimal("10.50"))
                .connectionStatus(TrackingConnectionStatus.CONNECTED)
                .status(TrackingStatus.ACTIVE)
                .lastPingAt(ZonedDateTime.now())
                .build();

        DriverLocation saved = driverLocationRepository.save(location);
        entityManager.flush();
        entityManager.clear();

        assertThat(saved.getId()).isNotNull();

        Optional<DriverLocation> activeOpt = driverLocationRepository.findByDriverIdAndStatus(testDriver.getId(), TrackingStatus.ACTIVE);
        assertThat(activeOpt).isPresent();
        assertThat(activeOpt.get().getDriver().getId()).isEqualTo(testDriver.getId());
        assertThat(activeOpt.get().getShipment().getId()).isEqualTo(testShipment1.getId());
        assertThat(activeOpt.get().getLatitude()).isEqualByComparingTo(new BigDecimal("18.5204303"));
        assertThat(activeOpt.get().getLongitude()).isEqualByComparingTo(new BigDecimal("73.8567437"));
        assertThat(activeOpt.get().getConnectionStatus()).isEqualTo(TrackingConnectionStatus.CONNECTED);
        assertThat(activeOpt.get().getStatus()).isEqualTo(TrackingStatus.ACTIVE);

        boolean existsActive = driverLocationRepository.existsByDriverIdAndStatus(testDriver.getId(), TrackingStatus.ACTIVE);
        assertThat(existsActive).isTrue();
    }

    @Test
    void testUpdateLocationAndCompleteTracking() {
        DriverLocation location = DriverLocation.builder()
                .driver(testDriver)
                .shipment(testShipment1)
                .latitude(new BigDecimal("18.5200000"))
                .longitude(new BigDecimal("73.8500000"))
                .accuracy(new BigDecimal("12.00"))
                .connectionStatus(TrackingConnectionStatus.CONNECTED)
                .status(TrackingStatus.ACTIVE)
                .lastPingAt(ZonedDateTime.now())
                .build();

        DriverLocation saved = driverLocationRepository.save(location);
        entityManager.flush();

        // Simulate GPS location update
        saved.setLatitude(new BigDecimal("18.5300000"));
        saved.setLongitude(new BigDecimal("73.8600000"));
        saved.setAccuracy(new BigDecimal("5.50"));
        saved.setLastPingAt(ZonedDateTime.now());
        driverLocationRepository.save(saved);
        entityManager.flush();

        // Complete delivery
        saved.setStatus(TrackingStatus.COMPLETED);
        saved.setEndedAt(ZonedDateTime.now());
        saved.setEndedReason("DELIVERED");
        driverLocationRepository.save(saved);
        entityManager.flush();
        entityManager.clear();

        Optional<DriverLocation> activeOpt = driverLocationRepository.findByDriverIdAndStatus(testDriver.getId(), TrackingStatus.ACTIVE);
        assertThat(activeOpt).isEmpty();

        boolean existsActive = driverLocationRepository.existsByDriverIdAndStatus(testDriver.getId(), TrackingStatus.ACTIVE);
        assertThat(existsActive).isFalse();

        Optional<DriverLocation> shipmentTracking = driverLocationRepository.findFirstByShipmentIdOrderByStartedAtDesc(testShipment1.getId());
        assertThat(shipmentTracking).isPresent();
        assertThat(shipmentTracking.get().getStatus()).isEqualTo(TrackingStatus.COMPLETED);
        assertThat(shipmentTracking.get().getEndedReason()).isEqualTo("DELIVERED");
    }

    @Test
    void testFindAllActiveWithDriverAndShipment() {
        DriverLocation location = DriverLocation.builder()
                .driver(testDriver)
                .shipment(testShipment1)
                .latitude(new BigDecimal("18.5204303"))
                .longitude(new BigDecimal("73.8567437"))
                .accuracy(new BigDecimal("8.00"))
                .connectionStatus(TrackingConnectionStatus.CONNECTED)
                .status(TrackingStatus.ACTIVE)
                .lastPingAt(ZonedDateTime.now())
                .build();

        driverLocationRepository.save(location);
        entityManager.flush();
        entityManager.clear();

        List<DriverLocation> activeList = driverLocationRepository.findAllActiveWithDriverAndShipment(TrackingStatus.ACTIVE);
        assertThat(activeList).isNotEmpty();
        assertThat(activeList.stream().anyMatch(l -> l.getDriver().getId().equals(testDriver.getId()))).isTrue();
    }
}
