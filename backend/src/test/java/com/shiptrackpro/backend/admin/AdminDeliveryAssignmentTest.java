package com.shiptrackpro.backend.admin;

import com.shiptrackpro.backend.admin.dto.AssignmentResponse;
import com.shiptrackpro.backend.delivery.entity.DeliveryAssignment;
import com.shiptrackpro.backend.delivery.repository.DeliveryAssignmentRepository;
import com.shiptrackpro.backend.delivery.service.DeliveryService;
import com.shiptrackpro.backend.notifications.entity.Notification;
import com.shiptrackpro.backend.notifications.repository.NotificationRepository;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.dto.CustomerShipmentDto;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.tracking.entity.ShipmentTracking;
import com.shiptrackpro.backend.tracking.repository.ShipmentTrackingRepository;
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

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
public class AdminDeliveryAssignmentTest {

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private DeliveryAssignmentRepository deliveryAssignmentRepository;

    @Autowired
    private ShipmentTrackingRepository shipmentTrackingRepository;

    @Autowired
    private NotificationRepository notificationRepository;

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
                .senderName("Sender Admin Test")
                .senderPhone("9876543210")
                .receiverName("Receiver Admin Test")
                .receiverPhone("9876543211")
                .pickupAddress("Warehouse 1, Pune")
                .deliveryAddress("Tech Park, Mumbai")
                .packageDescription("Server Rack")
                .weight(15.0)
                .build();
    }

    @Test
    public void testGetPendingShipments_ReturnsOnlyCreatedShipments() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User driver = createUserWithRole("driver", RoleName.DRIVER);

        CreateShipmentResponse s1 = shipmentService.createShipment(validRequest(), customer);
        CreateShipmentResponse s2 = shipmentService.createShipment(validRequest(), customer);

        // Assign s1 to driver, transitioning it to ASSIGNED
        deliveryService.assignShipment(s1.getId(), driver.getId());

        entityManager.flush();

        List<CustomerShipmentDto> pending = shipmentService.getPendingShipments();

        // Pending list must contain s2 (CREATED), but not s1 (ASSIGNED)
        assertThat(pending).anyMatch(s -> s.getId().equals(s2.getId()));
        assertThat(pending).noneMatch(s -> s.getId().equals(s1.getId()));
    }

    @Test
    public void testAssignDriver_Success() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User driver = createUserWithRole("driver", RoleName.DRIVER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);

        DeliveryAssignment assignment = deliveryService.assignShipment(created.getId(), driver.getId());
        entityManager.flush();

        // 1. Verify assignment record
        assertThat(assignment).isNotNull();
        assertThat(assignment.getShipment().getId()).isEqualTo(created.getId());
        assertThat(assignment.getDriver().getId()).isEqualTo(driver.getId());
        assertThat(assignment.getStatus()).isEqualTo("ASSIGNED");

        // 2. Verify shipment status transition
        Shipment updatedShipment = shipmentRepository.findById(created.getId()).orElseThrow();
        assertThat(updatedShipment.getStatus()).isEqualTo(ShipmentStatus.ASSIGNED);

        // 3. Verify tracking record
        List<ShipmentTracking> trackings = shipmentTrackingRepository.findByShipmentIdOrderByCreatedAtAsc(created.getId());
        assertThat(trackings).hasSizeGreaterThanOrEqualTo(2);
        ShipmentTracking lastTracking = trackings.get(trackings.size() - 1);
        assertThat(lastTracking.getStatus()).isEqualTo(ShipmentStatus.ASSIGNED);
        assertThat(lastTracking.getDescription()).contains(driver.getFirstName());

        // 4. Verify notifications for customer and driver
        List<Notification> customerNotifications = notificationRepository.findByUserId(customer.getId());
        assertThat(customerNotifications).anyMatch(n -> n.getType().equals("SHIPMENT_ASSIGNED"));

        List<Notification> driverNotifications = notificationRepository.findByUserId(driver.getId());
        assertThat(driverNotifications).anyMatch(n -> n.getType().equals("NEW_ASSIGNMENT"));

        // 5. Verify DTO mapping
        AssignmentResponse responseDto = deliveryService.mapToAssignmentResponse(assignment);
        assertThat(responseDto.getShipmentId()).isEqualTo(created.getId());
        assertThat(responseDto.getDriverId()).isEqualTo(driver.getId());
        assertThat(responseDto.getTrackingNumber()).isEqualTo(created.getTrackingNumber());
    }

    @Test
    public void testAssignDriver_InvalidDriverRoleFails() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User nonDriver = createUserWithRole("other_customer", RoleName.CUSTOMER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> deliveryService.assignShipment(created.getId(), nonDriver.getId()));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(ex.getReason()).contains("DRIVER");
    }

    @Test
    public void testAssignDriver_NonCreatedShipmentFails() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User driver1 = createUserWithRole("driver1", RoleName.DRIVER);
        User driver2 = createUserWithRole("driver2", RoleName.DRIVER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);

        // First assignment succeeds
        deliveryService.assignShipment(created.getId(), driver1.getId());

        // Re-assigning when already ASSIGNED fails with BAD_REQUEST
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> deliveryService.assignShipment(created.getId(), driver2.getId()));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(ex.getReason()).contains("CREATED");
    }

    @Test
    public void testAssignDriver_NotFoundFails() {
        User driver = createUserWithRole("driver", RoleName.DRIVER);
        UUID nonExistentShipmentId = UUID.randomUUID();

        ResponseStatusException ex1 = assertThrows(ResponseStatusException.class,
                () -> deliveryService.assignShipment(nonExistentShipmentId, driver.getId()));
        assertThat(ex1.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);
        UUID nonExistentDriverId = UUID.randomUUID();

        ResponseStatusException ex2 = assertThrows(ResponseStatusException.class,
                () -> deliveryService.assignShipment(created.getId(), nonExistentDriverId));
        assertThat(ex2.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
