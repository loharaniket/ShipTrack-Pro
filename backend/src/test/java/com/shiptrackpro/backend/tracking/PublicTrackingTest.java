package com.shiptrackpro.backend.tracking;

import com.shiptrackpro.backend.delivery.service.DeliveryService;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.tracking.dto.PublicTrackingResponse;
import com.shiptrackpro.backend.tracking.service.TrackingService;
import com.shiptrackpro.backend.user.entity.Role;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.entity.UserStatus;
import com.shiptrackpro.backend.user.repository.RoleRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
public class PublicTrackingTest {

    @Autowired
    private TrackingService trackingService;

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    private User createUserWithRole(String emailPrefix, RoleName roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException(roleName + " role not found"));

        User user = User.builder()
                .email(emailPrefix + "." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .firstName("Test")
                .lastName(roleName.name())
                .status(UserStatus.ACTIVE)
                .roles(Set.of(role))
                .build();

        User saved = userRepository.save(user);
        entityManager.flush();
        return saved;
    }

    private CreateShipmentRequest validRequest() {
        return CreateShipmentRequest.builder()
                .senderName("Sender Tracking Test")
                .senderPhone("9876543210")
                .receiverName("Receiver Tracking Test")
                .receiverPhone("9876543211")
                .pickupAddress("Kothrud, Pune")
                .deliveryAddress("Andheri, Mumbai")
                .packageDescription("Fragile Glassware")
                .weight(3.2)
                .build();
    }

    @Test
    public void testPublicTracking_CompleteTimelineOrderedAsc() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User driver = createUserWithRole("driver", RoleName.DRIVER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);
        deliveryService.assignShipment(created.getId(), driver.getId());
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.PICKED_UP, "Driver picked up package", driver);
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.IN_TRANSIT, "Package reached Pune sorting facility", driver);

        entityManager.flush();

        PublicTrackingResponse response = trackingService.getPublicTrackingTimeline(created.getTrackingNumber());

        assertThat(response).isNotNull();
        assertThat(response.getTrackingNumber()).isEqualTo(created.getTrackingNumber());
        assertThat(response.getCurrentStatus()).isEqualTo(ShipmentStatus.IN_TRANSIT);
        assertThat(response.getTimeline()).hasSize(4);

        // Verify sequential timeline ordering (CREATED -> ASSIGNED -> PICKED_UP -> IN_TRANSIT)
        assertThat(response.getTimeline().get(0).getStatus()).isEqualTo(ShipmentStatus.CREATED);
        assertThat(response.getTimeline().get(1).getStatus()).isEqualTo(ShipmentStatus.ASSIGNED);
        assertThat(response.getTimeline().get(2).getStatus()).isEqualTo(ShipmentStatus.PICKED_UP);
        assertThat(response.getTimeline().get(3).getStatus()).isEqualTo(ShipmentStatus.IN_TRANSIT);

        // Verify each event has non-null timestamps and descriptions
        response.getTimeline().forEach(event -> {
            assertThat(event.getCreatedAt()).isNotNull();
            assertThat(event.getDescription()).isNotBlank();
        });
    }

    @Test
    public void testPublicTracking_NotFoundThrows404() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                trackingService.getPublicTrackingTimeline("NON_EXISTENT_STP99999"));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
