package com.shiptrackpro.backend.address.controller;

import com.shiptrackpro.backend.address.dto.GeocodeRequest;
import com.shiptrackpro.backend.address.dto.GeocodeResultDto;
import com.shiptrackpro.backend.address.service.AddressService;
import com.shiptrackpro.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/addresses", "/api/addresses"})
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping("/geocode")
    public ResponseEntity<ApiResponse<GeocodeResultDto>> geocodeAddress(@Valid @RequestBody GeocodeRequest request) {
        GeocodeResultDto result = addressService.geocode(request.getRawAddress())
                .orElseGet(() -> GeocodeResultDto.builder()
                        .displayName(request.getRawAddress())
                        .line1(request.getRawAddress())
                        .build());

        return ResponseEntity.ok(ApiResponse.success("Address geocoded successfully", result));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<GeocodeResultDto>>> searchAddresses(
            @RequestParam(name = "query", defaultValue = "") String query) {
        List<GeocodeResultDto> results = addressService.searchAddresses(query);
        return ResponseEntity.ok(ApiResponse.success("Address suggestions retrieved", results));
    }
}
