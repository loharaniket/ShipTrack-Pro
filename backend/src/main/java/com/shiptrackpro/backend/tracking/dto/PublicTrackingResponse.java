package com.shiptrackpro.backend.tracking.dto;

import com.shiptrackpro.backend.address.dto.AddressDto;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicTrackingResponse {
    private String trackingNumber;
    private ShipmentStatus currentStatus;
    private String pickupAddress;
    private String deliveryAddress;
    private AddressDto originAddress;
    private AddressDto destinationAddress;
    private BigDecimal originLatitude;
    private BigDecimal originLongitude;
    private BigDecimal destLatitude;
    private BigDecimal destLongitude;
    private List<PublicTrackingTimelineDto> timeline;
}
