package com.shiptrackpro.backend.pod.controller;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.pod.dto.PodResponse;
import com.shiptrackpro.backend.pod.service.PodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping({"/api/operator", "/api/v1/operator"})
@RequiredArgsConstructor
public class PodController {

    private final PodService podService;

    @PostMapping(value = "/pod", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<PodResponse>> uploadPod(
            @RequestParam("shipmentId") UUID shipmentId,
            @RequestParam("receiverName") String receiverName,
            @RequestParam("photo") MultipartFile photo,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        PodResponse response = podService.uploadPod(shipmentId, receiverName, photo, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.getMessage(), response));
    }
}
