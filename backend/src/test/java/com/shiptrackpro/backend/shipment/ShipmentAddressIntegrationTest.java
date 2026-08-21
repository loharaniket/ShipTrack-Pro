package com.shiptrackpro.backend.shipment;

import com.shiptrackpro.backend.address.dto.AddressDto;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.dto.CustomerShipmentDto;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
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
public class ShipmentAddressIntegrationTest {

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private TrackingService trackingService;

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

    private User customer;

    @BeforeEach
    void setUp() {
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.CUSTOMER).description("Customer").build()));

        customer = userRepository.save(User.builder()
                .email("ship_addr_" + UUID.randomUUID() + "@client.com")
                .passwordHash(passwordEncoder.encode("secret"))
                .firstName("John")
                .lastName("Doe")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(customerRole))
                .build());
    }

    @Test
    void testCreateShipment_WithRawStrings_AutoGeocodesAndNormalizes() {
        CreateShipmentRequest req = CreateShipmentRequest.builder()
                .senderName("John Sender")
                .senderPhone("+1234567890")
                .receiverName("Jane Receiver")
                .receiverPhone("+1234567891")
                .pickupAddress("Bandra West, Mumbai")
                .deliveryAddress("Kothrud, Pune")
                .packageDescription("Gifts Box")
                .weight(2.0)
                .build();

        CreateShipmentResponse response = shipmentService.createShipment(req, customer);
        assertThat(response).isNotNull();
        assertThat(response.getId()).isNotNull();

        entityManager.flush();
        entityManager.clear();

        Shipment shipment = shipmentRepository.findById(response.getId()).orElseThrow();
        assertThat(shipment.getOriginAddress()).isNotNull();
        assertThat(shipment.getOriginAddress().getLatitude()).isNotNull();
        assertThat(shipment.getOriginAddress().getLongitude()).isNotNull();
        assertThat(shipment.getDestinationAddress()).isNotNull();
        assertThat(shipment.getDestinationAddress().getLatitude()).isNotNull();
        assertThat(shipment.getDestinationAddress().getLongitude()).isNotNull();

        // Check DTO Mapping
        CustomerShipmentDto dto = shipmentService.getCustomerShipmentById(shipment.getId(), customer);
        assertThat(dto.getOriginAddress()).isNotNull();
        assertThat(dto.getDestinationAddress()).isNotNull();
        assertThat(dto.getPickupAddress()).isEqualTo("Bandra West, Mumbai");
        assertThat(dto.getDeliveryAddress()).isEqualTo("Kothrud, Pune");

        // Check Public Tracking Response
        PublicTrackingResponse tracking = trackingService.getPublicTrackingTimeline(shipment.getTrackingNumber());
        assertThat(tracking.getOriginLatitude()).isNotNull();
        assertThat(tracking.getOriginLongitude()).isNotNull();
        assertThat(tracking.getDestLatitude()).isNotNull();
        assertThat(tracking.getDestLongitude()).isNotNull();
    }

    @Test
    void testCreateShipment_WithStructuredAddressDtos_PersistsExactCoordinates() {
        AddressDto originDto = AddressDto.builder()
                .line1("100 Main St")
                .city("San Francisco")
                .state("CA")
                .country("USA")
                .postalCode("94105")
                .latitude(new BigDecimal("37.7912000"))
                .longitude(new BigDecimal("-122.3956000"))
                .build();

        AddressDto destDto = AddressDto.builder()
                .line1("200 Broadway")
                .city("New York")
                .state("NY")
                .country("USA")
                .postalCode("10038")
                .latitude(new BigDecimal("40.7118000"))
                .longitude(new BigDecimal("-74.0081000"))
                .build();

        CreateShipmentRequest req = CreateShipmentRequest.builder()
                .senderName("Acme Corp")
                .senderPhone("+18005550199")
                .receiverName("Globex Corp")
                .receiverPhone("+18005550188")
                .pickupAddress("100 Main St, San Francisco, CA")
                .deliveryAddress("200 Broadway, New York, NY")
                .originAddress(originDto)
                .destinationAddress(destDto)
                .packageDescription("Server Hardware")
                .weight(15.5)
                .build();

        CreateShipmentResponse response = shipmentService.createShipment(req, customer);
        assertThat(response).isNotNull();

        entityManager.flush();
        entityManager.clear();

        Shipment shipment = shipmentRepository.findById(response.getId()).orElseThrow();
        assertThat(shipment.getOriginAddress().getLatitude()).isEqualByComparingTo(new BigDecimal("37.7912000"));
        assertThat(shipment.getOriginAddress().getLongitude()).isEqualByComparingTo(new BigDecimal("-122.3956000"));
        assertThat(shipment.getDestinationAddress().getLatitude()).isEqualByComparingTo(new BigDecimal("40.7118000"));
        assertThat(shipment.getDestinationAddress().getLongitude()).isEqualByComparingTo(new BigDecimal("-74.0081000"));

        PublicTrackingResponse tracking = trackingService.getPublicTrackingTimeline(shipment.getTrackingNumber());
        assertThat(tracking.getOriginLatitude()).isEqualByComparingTo(new BigDecimal("37.7912000"));
        assertThat(tracking.getDestLatitude()).isEqualByComparingTo(new BigDecimal("40.7118000"));
    }
}
