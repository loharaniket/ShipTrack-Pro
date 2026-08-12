package com.shiptrackpro.backend.pod.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.pod.dto.PodSubmitRequest;
import com.shiptrackpro.backend.pod.entity.PodRecord;
import com.shiptrackpro.backend.pod.service.PodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pod")
@RequiredArgsConstructor
public class PodController {

    private final PodService podService;

    @PostMapping("/upload-photo")
    public ResponseEntity<ApiResponse<String>> uploadPhoto(@RequestParam("file") MultipartFile file) {
        try {
            // Very beginner friendly approach: directly base64 encode the uploaded file
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            return ResponseEntity.ok(ApiResponse.success(base64Image, "Photo uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to upload photo"));
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<PodRecord>> submitPod(@RequestBody PodSubmitRequest request) {
        PodRecord record = podService.submitPod(request);
        return ResponseEntity.ok(ApiResponse.success("POD submitted successfully", record));
    }

    @GetMapping("/records")
    public ResponseEntity<ApiResponse<List<PodRecord>>> getRecords() {
        return ResponseEntity.ok(ApiResponse.success("Records retrieved", podService.getPendingRecords()));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<PodRecord>> verifyPod(@PathVariable UUID id) {
        PodRecord record = podService.updateStatus(id, "VERIFIED");
        return ResponseEntity.ok(ApiResponse.success("POD verified", record));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PodRecord>> rejectPod(@PathVariable UUID id) {
        PodRecord record = podService.updateStatus(id, "REJECTED");
        return ResponseEntity.ok(ApiResponse.success("POD rejected", record));
    }
}
