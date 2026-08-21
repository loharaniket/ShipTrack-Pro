package com.shiptrackpro.backend.address.service;

import com.shiptrackpro.backend.address.dto.GeocodeResultDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface GeocodingService {

    Optional<GeocodeResultDto> geocode(String rawAddress);

    List<GeocodeResultDto> searchAddresses(String query);

    Optional<GeocodeResultDto> reverseGeocode(BigDecimal latitude, BigDecimal longitude);
}
