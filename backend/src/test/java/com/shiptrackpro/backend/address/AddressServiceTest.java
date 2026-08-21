package com.shiptrackpro.backend.address;

import com.shiptrackpro.backend.address.controller.AddressController;
import com.shiptrackpro.backend.address.dto.AddressDto;
import com.shiptrackpro.backend.address.dto.GeocodeRequest;
import com.shiptrackpro.backend.address.dto.GeocodeResultDto;
import com.shiptrackpro.backend.address.entity.Address;
import com.shiptrackpro.backend.address.service.AddressService;
import com.shiptrackpro.backend.address.service.GeocodingService;
import com.shiptrackpro.backend.common.response.ApiResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class AddressServiceTest {

    @Autowired
    private AddressService addressService;

    @Autowired
    private GeocodingService geocodingService;

    @Autowired
    private AddressController addressController;

    @Test
    void testGeocodingService_KnownCityCentroidFallback() {
        Optional<GeocodeResultDto> result = geocodingService.geocode("Nariman Point, Mumbai, India");

        assertThat(result).isPresent();
        GeocodeResultDto dto = result.get();
        assertThat(dto.getCity()).isEqualTo("Mumbai");
        assertThat(dto.getLatitude()).isNotNull();
        assertThat(dto.getLongitude()).isNotNull();
    }

    @Test
    void testFindOrCreateFromRaw_Success() {
        Address address = addressService.findOrCreateFromRaw("Kothrud, Pune, Maharashtra");

        assertThat(address).isNotNull();
        assertThat(address.getId()).isNotNull();
        assertThat(address.getCity()).isEqualTo("Pune");
        assertThat(address.getState()).isEqualTo("Maharashtra");
        assertThat(address.getLatitude()).isNotNull();
        assertThat(address.getLongitude()).isNotNull();
    }

    @Test
    void testFindOrCreateAddress_StructuredDto() {
        AddressDto dto = AddressDto.builder()
                .line1("742 Evergreen Terrace")
                .city("Springfield")
                .state("OR")
                .country("USA")
                .postalCode("97477")
                .latitude(new BigDecimal("44.0462000"))
                .longitude(new BigDecimal("-123.0220000"))
                .build();

        Address address = addressService.findOrCreateAddress(dto);

        assertThat(address).isNotNull();
        assertThat(address.getId()).isNotNull();
        assertThat(address.getLine1()).isEqualTo("742 Evergreen Terrace");
        assertThat(address.getCity()).isEqualTo("Springfield");
        assertThat(address.getLatitude()).isEqualByComparingTo(new BigDecimal("44.0462000"));
        assertThat(address.getLongitude()).isEqualByComparingTo(new BigDecimal("-123.0220000"));

        AddressDto converted = addressService.toDto(address);
        assertThat(converted.getFormattedAddress()).contains("742 Evergreen Terrace", "Springfield", "OR");
    }

    @Test
    void testAddressController_GeocodeEndpoint() {
        GeocodeRequest req = GeocodeRequest.builder()
                .rawAddress("Bandra West, Mumbai")
                .build();

        ResponseEntity<ApiResponse<GeocodeResultDto>> response = addressController.geocodeAddress(req);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData().getLatitude()).isNotNull();
        assertThat(response.getBody().getData().getLongitude()).isNotNull();
    }

    @Test
    void testAddressController_SearchSuggestionsEndpoint() {
        ResponseEntity<ApiResponse<List<GeocodeResultDto>>> response = addressController.searchAddresses("Bangalore");

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData()).isNotEmpty();
        assertThat(response.getBody().getData().get(0).getCity().toLowerCase()).containsAnyOf("bangalore", "bengaluru");
    }
}
