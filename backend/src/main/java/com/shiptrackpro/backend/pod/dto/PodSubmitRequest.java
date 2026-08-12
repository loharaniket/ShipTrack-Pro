package com.shiptrackpro.backend.pod.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class PodSubmitRequest {
    private UUID shipmentId;
    private UUID driverId;
    private String packagePhotoBase64;
    private String doorPhotoBase64;
    private String signatureBase64;
    private Double latitude;
    private Double longitude;
}
