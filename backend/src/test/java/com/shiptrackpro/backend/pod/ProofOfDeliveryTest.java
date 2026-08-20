package com.shiptrackpro.backend.pod;

import com.shiptrackpro.backend.delivery.service.DeliveryService;
import com.shiptrackpro.backend.notifications.entity.Notification;
import com.shiptrackpro.backend.notifications.repository.NotificationRepository;
import com.shiptrackpro.backend.pod.dto.PodResponse;
import com.shiptrackpro.backend.pod.repository.ProofOfDeliveryRepository;
import com.shiptrackpro.backend.pod.service.PodService;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
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
import org.springframework.mock.web.MockMultipartFile;
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
public class ProofOfDeliveryTest {

    @Autowired
    private PodService podService;

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ProofOfDeliveryRepository proofOfDeliveryRepository;

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
                .senderName("POD Sender")
                .senderPhone("9876543210")
                .receiverName("POD Receiver")
                .receiverPhone("9876543211")
                .pickupAddress("Aundh, Pune")
                .deliveryAddress("Bandra, Mumbai")
                .packageDescription("Camera equipment")
                .weight(4.0)
                .build();
    }

    private MockMultipartFile createMockPhoto() {
        return new MockMultipartFile(
                "photo",
                "delivery_pod.jpg",
                "image/jpeg",
                "Dummy image binary data for testing".getBytes()
        );
    }

    @Test
    public void testUploadPod_Success() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User driver = createUserWithRole("driver", RoleName.DRIVER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);
        deliveryService.assignShipment(created.getId(), driver.getId());
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.PICKED_UP, "Picked up", driver);
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.IN_TRANSIT, "In transit", driver);
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.OUT_FOR_DELIVERY, "Out for delivery", driver);

        entityManager.flush();

        MockMultipartFile photo = createMockPhoto();
        PodResponse response = podService.uploadPod(created.getId(), "Rahul Deshmukh", photo, driver);

        assertThat(response).isNotNull();
        assertThat(response.getShipmentId()).isEqualTo(created.getId());
        assertThat(response.getReceiverName()).isEqualTo("Rahul Deshmukh");
        assertThat(response.getPhotoUrl()).contains("/uploads/pod/");
        assertThat(response.getDeliveryTime()).isNotNull();

        // 1. Verify shipment status transition to DELIVERED
        Shipment updatedShipment = shipmentRepository.findById(created.getId()).orElseThrow();
        assertThat(updatedShipment.getStatus()).isEqualTo(ShipmentStatus.DELIVERED);

        // 2. Verify tracking record
        List<ShipmentTracking> trackings = shipmentTrackingRepository.findByShipmentIdOrderByCreatedAtAsc(created.getId());
        ShipmentTracking lastTracking = trackings.get(trackings.size() - 1);
        assertThat(lastTracking.getStatus()).isEqualTo(ShipmentStatus.DELIVERED);
        assertThat(lastTracking.getDescription()).contains("Rahul Deshmukh");

        // 3. Verify customer notification
        List<Notification> notifications = notificationRepository.findByUserId(customer.getId());
        assertThat(notifications).anyMatch(n -> n.getType().equals("SHIPMENT_DELIVERED"));
    }

    @Test
    public void testUploadPod_InvalidShipmentStatus_Fails() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User driver = createUserWithRole("driver", RoleName.DRIVER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);
        deliveryService.assignShipment(created.getId(), driver.getId());
        // Status is ASSIGNED, not OUT_FOR_DELIVERY

        MockMultipartFile photo = createMockPhoto();
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                podService.uploadPod(created.getId(), "Receiver Name", photo, driver));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(ex.getReason()).contains("OUT_FOR_DELIVERY");
    }

    @Test
    public void testUploadPod_UnassignedDriver_IsForbidden() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User assignedDriver = createUserWithRole("assignedDriver", RoleName.DRIVER);
        User otherDriver = createUserWithRole("otherDriver", RoleName.DRIVER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);
        deliveryService.assignShipment(created.getId(), assignedDriver.getId());
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.PICKED_UP, "Picked up", assignedDriver);
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.IN_TRANSIT, "In transit", assignedDriver);
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.OUT_FOR_DELIVERY, "Out for delivery", assignedDriver);

        MockMultipartFile photo = createMockPhoto();
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                podService.uploadPod(created.getId(), "Receiver Name", photo, otherDriver));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    public void testGetPodDetails_CustomerOwnerAndAdminAccess() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User otherCustomer = createUserWithRole("otherCustomer", RoleName.CUSTOMER);
        User admin = createUserWithRole("admin", RoleName.ADMINISTRATOR);
        User support = createUserWithRole("support", RoleName.SUPPORT_AGENT);
        User driver = createUserWithRole("driver", RoleName.DRIVER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);
        deliveryService.assignShipment(created.getId(), driver.getId());
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.PICKED_UP, "Picked up", driver);
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.IN_TRANSIT, "In transit", driver);
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.OUT_FOR_DELIVERY, "Out for delivery", driver);

        MockMultipartFile photo = createMockPhoto();
        podService.uploadPod(created.getId(), "Receiver Name", photo, driver);
        entityManager.flush();

        // 1. Owner customer can view
        PodResponse ownerPod = podService.getPodDetails(created.getId(), customer);
        assertThat(ownerPod).isNotNull();
        assertThat(ownerPod.getReceiverName()).isEqualTo("Receiver Name");

        // 2. Admin can view
        PodResponse adminPod = podService.getPodDetails(created.getId(), admin);
        assertThat(adminPod).isNotNull();

        // 3. Support can view
        PodResponse supportPod = podService.getPodDetails(created.getId(), support);
        assertThat(supportPod).isNotNull();

        // 4. Other customer is blocked (403)
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                podService.getPodDetails(created.getId(), otherCustomer));
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
