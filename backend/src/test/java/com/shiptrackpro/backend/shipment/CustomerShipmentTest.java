package com.shiptrackpro.backend.shipment;

import com.shiptrackpro.backend.auth.dto.RegisterRequest;
import com.shiptrackpro.backend.auth.service.AuthService;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.dto.CustomerShipmentDto;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.repository.RoleRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.Role;
import com.shiptrackpro.backend.user.entity.UserStatus;
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

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
public class CustomerShipmentTest {

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    // Create a customer user directly using the repository (no separate transaction)
    // This avoids the cross-transaction boundary issue when calling authService.register()
    private User createCustomer(String emailPrefix) {
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));

        User user = User.builder()
                .email(emailPrefix + "." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .firstName("Test")
                .lastName("Customer")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(customerRole))
                .build();

        User saved = userRepository.save(user);
        entityManager.flush(); // ensure it's visible in same transaction
        return saved;
    }

    // Helper: build a valid CreateShipmentRequest
    private CreateShipmentRequest validRequest() {
        return CreateShipmentRequest.builder()
                .senderName("Aniket Lohar")
                .senderPhone("9000000001")
                .receiverName("Rahul Patil")
                .receiverPhone("9000000002")
                .pickupAddress("123 Pune Street, Pune")
                .deliveryAddress("456 Mumbai Road, Mumbai")
                .packageDescription("Electronics - Laptop")
                .weight(2.5)
                .build();
    }

    @Test
    public void testCreateShipment_Success() {
        User customer = createCustomer("shiptest");
        CreateShipmentResponse response = shipmentService.createShipment(validRequest(), customer);

        assertThat(response).isNotNull();
        assertThat(response.getTrackingNumber()).startsWith("STP");
        assertThat(response.getStatus()).isEqualTo("CREATED");
        assertThat(response.getMessage()).isEqualTo("Shipment created");
        assertThat(response.getId()).isNotNull();
    }

    @Test
    public void testCreateShipment_TrackingNumberIsUnique() {
        User customer = createCustomer("seqtest");

        CreateShipmentResponse r1 = shipmentService.createShipment(validRequest(), customer);
        CreateShipmentResponse r2 = shipmentService.createShipment(validRequest(), customer);

        // Both should start with STP and be different
        assertThat(r1.getTrackingNumber()).startsWith("STP");
        assertThat(r2.getTrackingNumber()).startsWith("STP");
        assertThat(r1.getTrackingNumber()).isNotEqualTo(r2.getTrackingNumber());
    }

    @Test
    public void testGetCustomerShipments_OnlyOwnShipments() {
        User customerA = createCustomer("custA");
        User customerB = createCustomer("custB");

        shipmentService.createShipment(validRequest(), customerA);
        shipmentService.createShipment(validRequest(), customerB);
        shipmentService.createShipment(validRequest(), customerA);

        entityManager.flush();
        entityManager.clear();

        // Reload customers so their lazy-loaded roles are visible
        final User reloadedA = userRepository.findById(customerA.getId()).orElseThrow();
        final User reloadedB = userRepository.findById(customerB.getId()).orElseThrow();

        List<CustomerShipmentDto> shipmentsA = shipmentService.getCustomerShipments(reloadedA);
        List<CustomerShipmentDto> shipmentsB = shipmentService.getCustomerShipments(reloadedB);

        // Customer A sees only their 2 shipments
        assertThat(shipmentsA).hasSize(2);
        assertThat(shipmentsA).allMatch(s -> s.getCustomerId().equals(reloadedA.getId()));

        // Customer B sees only their 1 shipment
        assertThat(shipmentsB).hasSize(1);
        assertThat(shipmentsB.get(0).getCustomerId()).isEqualTo(reloadedB.getId());
    }

    @Test
    public void testGetCustomerShipmentById_Success() {
        User customer = createCustomer("byidtest");
        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);

        CustomerShipmentDto dto = shipmentService.getCustomerShipmentById(created.getId(), customer);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(created.getId());
        assertThat(dto.getTrackingNumber()).isEqualTo(created.getTrackingNumber());
        assertThat(dto.getStatus()).isEqualTo(ShipmentStatus.CREATED);
    }

    @Test
    public void testGetCustomerShipmentById_AnotherCustomerIsBlocked() {
        User customerA = createCustomer("ownerA");
        User customerB = createCustomer("ownerB");
        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customerA);

        // CustomerB should get FORBIDDEN when accessing customerA's shipment
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> shipmentService.getCustomerShipmentById(created.getId(), customerB));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
