package com.shiptrackpro.backend.pod.service;

import com.shiptrackpro.backend.delivery.repository.DriverRepository;
import com.shiptrackpro.backend.pod.dto.PodSubmitRequest;
import com.shiptrackpro.backend.pod.entity.PodRecord;
import com.shiptrackpro.backend.pod.repository.PodRecordRepository;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PodService {

    private final PodRecordRepository podRecordRepository;
    private final ShipmentRepository shipmentRepository;
    private final DriverRepository driverRepository;

    public PodRecord submitPod(PodSubmitRequest request) {
        PodRecord record = new PodRecord();
        record.setShipment(shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new RuntimeException("Shipment not found")));
        
        if (request.getDriverId() != null) {
            record.setDriver(driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new RuntimeException("Driver not found")));
        }

        record.setPackagePhoto(request.getPackagePhotoBase64());
        record.setDoorPhoto(request.getDoorPhotoBase64());
        record.setSignature(request.getSignatureBase64());
        record.setLatitude(request.getLatitude());
        record.setLongitude(request.getLongitude());

        return podRecordRepository.save(record);
    }

    public List<PodRecord> getPendingRecords() {
        return podRecordRepository.findAll(); // Simplified for beginner friendly code
    }

    public PodRecord updateStatus(UUID id, String status) {
        PodRecord record = podRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("POD Record not found"));
        record.setStatus(status);
        return podRecordRepository.save(record);
    }
}
