package com.shiptrackpro.backend.pod.service;

import com.shiptrackpro.backend.notifications.service.NotificationService;
import com.shiptrackpro.backend.pod.entity.ProofOfDelivery;
import com.shiptrackpro.backend.pod.repository.ProofOfDeliveryRepository;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.tracking.entity.ShipmentTracking;
import com.shiptrackpro.backend.tracking.repository.ShipmentTrackingRepository;
import com.shiptrackpro.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PodService {

    private final ProofOfDeliveryRepository proofOfDeliveryRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentTrackingRepository shipmentTrackingRepository;
    private final NotificationService notificationService;

    @Transactional
    public ProofOfDelivery saveProofOfDelivery(UUID shipmentId, String receiverName, String photoUrl, User driver) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));

        ProofOfDelivery pod = ProofOfDelivery.builder()
                .shipment(shipment)
                .receiverName(receiverName)
                .photoUrl(photoUrl)
                .build();
        pod = proofOfDeliveryRepository.save(pod);

        // Transactionally update shipment status to DELIVERED
        shipment.setStatus(ShipmentStatus.DELIVERED);
        shipmentRepository.save(shipment);

        // Append tracking entry
        String driverName = driver != null ? driver.getFirstName() + " " + driver.getLastName() : "Driver";
        ShipmentTracking tracking = ShipmentTracking.builder()
                .shipment(shipment)
                .status(ShipmentStatus.DELIVERED)
                .description("Package delivered to " + receiverName)
                .updatedBy(driverName)
                .build();
        shipmentTrackingRepository.save(tracking);

        // Notify customer
        if (shipment.getCustomer() != null) {
            notificationService.createNotification(
                    shipment.getCustomer(),
                    "Shipment Delivered",
                    "Your shipment " + shipment.getTrackingNumber() + " has been successfully delivered to " + receiverName + ".",
                    "SHIPMENT_DELIVERED"
            );
        }

        return pod;
    }

    @Transactional(readOnly = true)
    public Optional<ProofOfDelivery> getPodByShipmentId(UUID shipmentId) {
        return proofOfDeliveryRepository.findByShipmentId(shipmentId);
    }
}
