package com.shiptrackpro.backend.address;

import com.shiptrackpro.backend.address.entity.Address;
import com.shiptrackpro.backend.address.repository.AddressRepository;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class AddressDatabaseTest {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void testAddressEntity_PersistAndRetrieve() {
        Address address = Address.builder()
                .line1("123 Market St")
                .line2("Suite 400")
                .city("San Francisco")
                .state("CA")
                .country("USA")
                .postalCode("94103")
                .latitude(new BigDecimal("37.7749295"))
                .longitude(new BigDecimal("-122.4194155"))
                .build();

        Address saved = addressRepository.save(address);
        entityManager.flush();
        entityManager.clear();

        Address fetched = addressRepository.findById(saved.getId()).orElseThrow();
        assertThat(fetched.getLine1()).isEqualTo("123 Market St");
        assertThat(fetched.getCity()).isEqualTo("San Francisco");
        assertThat(fetched.getLatitude()).isEqualByComparingTo(new BigDecimal("37.7749295"));
        assertThat(fetched.getLongitude()).isEqualByComparingTo(new BigDecimal("-122.4194155"));
        assertThat(fetched.getCreatedAt()).isNotNull();
        assertThat(fetched.getUpdatedAt()).isNotNull();
    }

    @Test
    void testShipmentWithNormalizedOriginAndDestinationAddresses() {
        Address origin = addressRepository.save(Address.builder()
                .line1("Bandra Kurla Complex")
                .city("Mumbai")
                .state("Maharashtra")
                .country("India")
                .postalCode("400051")
                .latitude(new BigDecimal("19.0657100"))
                .longitude(new BigDecimal("72.8683500"))
                .build());

        Address destination = addressRepository.save(Address.builder()
                .line1("Viman Nagar")
                .city("Pune")
                .state("Maharashtra")
                .country("India")
                .postalCode("411014")
                .latitude(new BigDecimal("18.5679100"))
                .longitude(new BigDecimal("73.9143400"))
                .build());

        Shipment shipment = Shipment.builder()
                .trackingNumber("STP_ADDR_" + UUID.randomUUID().toString().substring(0, 8))
                .senderName("Sender Corp")
                .senderPhone("+919999999901")
                .receiverName("Receiver Corp")
                .receiverPhone("+919999999902")
                .pickupAddress("Bandra Kurla Complex, Mumbai")
                .deliveryAddress("Viman Nagar, Pune")
                .originAddress(origin)
                .destinationAddress(destination)
                .status(ShipmentStatus.CREATED)
                .weight(3.5)
                .build();

        Shipment savedShipment = shipmentRepository.save(shipment);
        entityManager.flush();
        entityManager.clear();

        Shipment fetchedShipment = shipmentRepository.findById(savedShipment.getId()).orElseThrow();
        assertThat(fetchedShipment.getOriginAddress()).isNotNull();
        assertThat(fetchedShipment.getOriginAddress().getId()).isEqualTo(origin.getId());
        assertThat(fetchedShipment.getOriginAddress().getCity()).isEqualTo("Mumbai");
        assertThat(fetchedShipment.getDestinationAddress()).isNotNull();
        assertThat(fetchedShipment.getDestinationAddress().getId()).isEqualTo(destination.getId());
        assertThat(fetchedShipment.getDestinationAddress().getCity()).isEqualTo("Pune");
        // Check backwards compatibility of raw string columns
        assertThat(fetchedShipment.getPickupAddress()).isEqualTo("Bandra Kurla Complex, Mumbai");
        assertThat(fetchedShipment.getDeliveryAddress()).isEqualTo("Viman Nagar, Pune");
    }

    @Test
    void testAddressRepository_FindQueries() {
        addressRepository.save(Address.builder()
                .line1("MG Road")
                .city("Bangalore")
                .state("Karnataka")
                .country("India")
                .postalCode("560001")
                .latitude(new BigDecimal("12.9716000"))
                .longitude(new BigDecimal("77.5946000"))
                .build());

        entityManager.flush();

        List<Address> byCity = addressRepository.findByCityIgnoreCase("bangalore");
        assertThat(byCity).isNotEmpty();
        assertThat(byCity.get(0).getPostalCode()).isEqualTo("560001");

        List<Address> byPostal = addressRepository.findByPostalCode("560001");
        assertThat(byPostal).isNotEmpty();
    }
}
