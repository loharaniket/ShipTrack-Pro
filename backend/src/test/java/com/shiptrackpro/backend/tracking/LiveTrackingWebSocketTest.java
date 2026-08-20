package com.shiptrackpro.backend.tracking;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.config.security.JwtService;
import com.shiptrackpro.backend.delivery.entity.DeliveryAssignment;
import com.shiptrackpro.backend.delivery.repository.DeliveryAssignmentRepository;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.tracking.dto.DriverLocationDto;
import com.shiptrackpro.backend.tracking.dto.StartTrackingRequest;
import com.shiptrackpro.backend.tracking.dto.UpdateLocationRequest;
import com.shiptrackpro.backend.tracking.service.LiveTrackingService;
import com.shiptrackpro.backend.user.entity.Role;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.entity.UserStatus;
import com.shiptrackpro.backend.user.repository.RoleRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class LiveTrackingWebSocketTest {

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

    @Autowired
    private JwtService jwtService;

    private User driver;
    private Shipment shipment;

    @BeforeEach
    void setUp() {
        Role driverRole = roleRepository.findByName(RoleName.DRIVER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.DRIVER).description("Driver").build()));

        driver = userRepository.save(User.builder()
                .email("ws_driver_" + UUID.randomUUID() + "@shiptrack.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .firstName("Vijay")
                .lastName("Verma")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(driverRole))
                .build());

        shipment = shipmentRepository.save(Shipment.builder()
                .trackingNumber("STP" + System.currentTimeMillis())
                .senderName("Sender WS")
                .senderPhone("+919999999910")
                .receiverName("Receiver WS")
                .receiverPhone("+919999999920")
                .pickupAddress("Kurla, Mumbai")
                .deliveryAddress("Shivaji Nagar, Pune")
                .packageDescription("Camera Unit")
                .weight(1.8)
                .status(ShipmentStatus.ASSIGNED)
                .build());

        deliveryAssignmentRepository.save(DeliveryAssignment.builder()
                .shipment(shipment)
                .driver(driver)
                .status("ASSIGNED")
                .build());
    }

    @Test
    void testJwtTokenGenerationForWebSocket() {
        CustomUserDetails userDetails = new CustomUserDetails(driver);
        String token = jwtService.generateToken(userDetails);

        assertThat(token).isNotBlank();
        assertThat(jwtService.validateJwtToken(token)).isTrue();
        assertThat(jwtService.getUserNameFromJwtToken(token)).isEqualTo(driver.getEmail());
    }

    @Test
    void testBroadcastLocationWorkflow() {
        // Start tracking and trigger broadcast
        DriverLocationDto started = liveTrackingService.startTracking(
                StartTrackingRequest.builder().shipmentId(shipment.getId()).build(), driver);
        assertThat(started).isNotNull();

        // Update GPS coordinates and trigger broadcast
        UpdateLocationRequest updateReq = UpdateLocationRequest.builder()
                .shipmentId(shipment.getId())
                .latitude(new BigDecimal("18.5204300"))
                .longitude(new BigDecimal("73.8567400"))
                .accuracy(new BigDecimal("4.20"))
                .build();

        DriverLocationDto updated = liveTrackingService.updateLocation(updateReq, driver);
        assertThat(updated).isNotNull();
        assertThat(updated.getLatitude()).isEqualByComparingTo(new BigDecimal("18.5204300"));

        // Stop tracking and broadcast final state
        DriverLocationDto stopped = liveTrackingService.stopTracking(shipment.getId(), "DELIVERED", driver);
        assertThat(stopped).isNotNull();
        assertThat(stopped.getEndedReason()).isEqualTo("DELIVERED");
    }
}
