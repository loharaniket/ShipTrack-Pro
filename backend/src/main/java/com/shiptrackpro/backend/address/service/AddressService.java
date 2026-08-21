package com.shiptrackpro.backend.address.service;

import com.shiptrackpro.backend.address.dto.AddressDto;
import com.shiptrackpro.backend.address.dto.GeocodeResultDto;
import com.shiptrackpro.backend.address.entity.Address;
import com.shiptrackpro.backend.address.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final GeocodingService geocodingService;

    @Transactional
    public Address findOrCreateAddress(AddressDto dto) {
        if (dto == null) {
            return findOrCreateFromRaw("Unknown Location");
        }

        if (dto.getId() != null) {
            Optional<Address> existing = addressRepository.findById(dto.getId());
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        BigDecimal lat = dto.getLatitude();
        BigDecimal lng = dto.getLongitude();

        // If coordinates missing, geocode address string
        if (lat == null || lng == null) {
            String fullStr = buildRawAddressString(dto);
            GeocodeResultDto geo = geocodingService.geocode(fullStr).orElse(null);
            if (geo != null) {
                lat = geo.getLatitude();
                lng = geo.getLongitude();
                if (dto.getCity() == null || dto.getCity().isEmpty()) dto.setCity(geo.getCity());
                if (dto.getState() == null || dto.getState().isEmpty()) dto.setState(geo.getState());
                if (dto.getCountry() == null || dto.getCountry().isEmpty()) dto.setCountry(geo.getCountry());
                if (dto.getPostalCode() == null || dto.getPostalCode().isEmpty()) dto.setPostalCode(geo.getPostalCode());
            }
        }

        if (lat == null) lat = new BigDecimal("40.7127760");
        if (lng == null) lng = new BigDecimal("-74.0059740");

        String line1 = dto.getLine1() != null && !dto.getLine1().trim().isEmpty() 
                ? dto.getLine1().trim() 
                : "Address Location";
        String city = dto.getCity() != null && !dto.getCity().trim().isEmpty() 
                ? dto.getCity().trim() 
                : "New York";
        String state = dto.getState() != null && !dto.getState().trim().isEmpty() 
                ? dto.getState().trim() 
                : "NY";
        String country = dto.getCountry() != null && !dto.getCountry().trim().isEmpty() 
                ? dto.getCountry().trim() 
                : "USA";

        Address address = Address.builder()
                .line1(line1)
                .line2(dto.getLine2())
                .city(city)
                .state(state)
                .country(country)
                .postalCode(dto.getPostalCode())
                .latitude(lat)
                .longitude(lng)
                .build();

        return addressRepository.save(address);
    }

    @Transactional
    public Address findOrCreateFromRaw(String rawAddress) {
        if (rawAddress == null || rawAddress.trim().isEmpty()) {
            rawAddress = "Unknown Address";
        }

        GeocodeResultDto geo = geocodingService.geocode(rawAddress)
                .orElse(null);

        BigDecimal lat = (geo != null && geo.getLatitude() != null) 
                ? geo.getLatitude() 
                : new BigDecimal("40.7127760");
        BigDecimal lng = (geo != null && geo.getLongitude() != null) 
                ? geo.getLongitude() 
                : new BigDecimal("-74.0059740");
        String city = (geo != null && geo.getCity() != null && !geo.getCity().isEmpty()) 
                ? geo.getCity() 
                : "New York";
        String state = (geo != null && geo.getState() != null && !geo.getState().isEmpty()) 
                ? geo.getState() 
                : "NY";
        String country = (geo != null && geo.getCountry() != null && !geo.getCountry().isEmpty()) 
                ? geo.getCountry() 
                : "USA";
        String postalCode = (geo != null) ? geo.getPostalCode() : null;

        Address address = Address.builder()
                .line1(rawAddress)
                .city(city)
                .state(state)
                .country(country)
                .postalCode(postalCode)
                .latitude(lat)
                .longitude(lng)
                .build();

        return addressRepository.save(address);
    }

    @Transactional(readOnly = true)
    public AddressDto toDto(Address address) {
        if (address == null) return null;

        StringBuilder sb = new StringBuilder(address.getLine1());
        if (address.getLine2() != null && !address.getLine2().isEmpty()) {
            sb.append(", ").append(address.getLine2());
        }
        if (address.getCity() != null && !address.getCity().isEmpty()) {
            sb.append(", ").append(address.getCity());
        }
        if (address.getState() != null && !address.getState().isEmpty()) {
            sb.append(", ").append(address.getState());
        }
        if (address.getPostalCode() != null && !address.getPostalCode().isEmpty()) {
            sb.append(" ").append(address.getPostalCode());
        }

        return AddressDto.builder()
                .id(address.getId())
                .line1(address.getLine1())
                .line2(address.getLine2())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .postalCode(address.getPostalCode())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .formattedAddress(sb.toString())
                .build();
    }

    public List<GeocodeResultDto> searchAddresses(String query) {
        return geocodingService.searchAddresses(query);
    }

    public Optional<GeocodeResultDto> geocode(String rawAddress) {
        return geocodingService.geocode(rawAddress);
    }

    private String buildRawAddressString(AddressDto dto) {
        StringBuilder sb = new StringBuilder();
        if (dto.getLine1() != null) sb.append(dto.getLine1());
        if (dto.getCity() != null) sb.append(" ").append(dto.getCity());
        if (dto.getState() != null) sb.append(" ").append(dto.getState());
        if (dto.getPostalCode() != null) sb.append(" ").append(dto.getPostalCode());
        return sb.toString().trim();
    }
}
