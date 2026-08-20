package com.shiptrackpro.backend.pod.service;

import com.shiptrackpro.backend.delivery.entity.DeliveryAssignment;
import com.shiptrackpro.backend.delivery.repository.DeliveryAssignmentRepository;
import com.shiptrackpro.backend.notifications.service.NotificationService;
import com.shiptrackpro.backend.pod.dto.PodResponse;
import com.shiptrackpro.backend.pod.entity.ProofOfDelivery;
import com.shiptrackpro.backend.pod.repository.ProofOfDeliveryRepository;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.tracking.entity.ShipmentTracking;
import com.shiptrackpro.backend.tracking.repository.ShipmentTrackingRepository;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.tracking.service.LiveTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PodService {

    private final ProofOfDeliveryRepository proofOfDeliveryRepository;
    private final ShipmentRepository shipmentRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final ShipmentTrackingRepository shipmentTrackingRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;
    private final LiveTrackingService liveTrackingService;

    @Transactional
    public PodResponse uploadPod(UUID shipmentId, String receiverName, MultipartFile photo, User user) {
        if (receiverName == null || receiverName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Receiver name is required");
        }

        if (photo == null || photo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo file is required");
        }

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));

        // Validate driver assignment if not administrator
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ADMINISTRATOR);

        if (!isAdmin) {
            DeliveryAssignment assignment = deliveryAssignmentRepository.findByShipmentId(shipmentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shipment is not assigned to any driver"));

            if (!assignment.getDriver().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this shipment");
            }
        }

        // Validate that shipment is in OUT_FOR_DELIVERY status
        if (shipment.getStatus() != ShipmentStatus.OUT_FOR_DELIVERY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Shipment must be in OUT_FOR_DELIVERY status to complete delivery. Current status: " + shipment.getStatus());
        }

        // Save file to filesystem
        String photoUrl = fileStorageService.storePodFile(photo);

        // Save ProofOfDelivery entity
        ProofOfDelivery pod = ProofOfDelivery.builder()
                .shipment(shipment)
                .receiverName(receiverName.trim())
                .photoUrl("http://localhost:8080"+photoUrl)
                .build();
        pod = proofOfDeliveryRepository.saveAndFlush(pod);

        // Transactionally update shipment status to DELIVERED
        shipment.setStatus(ShipmentStatus.DELIVERED);
        Shipment savedShipment = shipmentRepository.save(shipment);

        // Append final tracking record
        String driverName = user.getFirstName() + " " + user.getLastName();
        ShipmentTracking tracking = ShipmentTracking.builder()
                .shipment(savedShipment)
                .status(ShipmentStatus.DELIVERED)
                .description("Package delivered to " + receiverName.trim())
                .updatedBy(driverName)
                .build();
        shipmentTrackingRepository.save(tracking);

        // Create in-app notification for customer
        if (savedShipment.getCustomer() != null) {
            notificationService.createNotification(
                    savedShipment.getCustomer(),
                    "Shipment Delivered",
                    "Your shipment " + savedShipment.getTrackingNumber() + " has been successfully delivered to " + receiverName.trim() + ".",
                    "SHIPMENT_DELIVERED"
            );
        }

        // Automatically complete live tracking session
        liveTrackingService.stopTracking(savedShipment.getId(), "DELIVERED", user);

        return mapToPodResponse(pod, "Proof of Delivery uploaded and shipment delivered successfully");
    }

    @Transactional(readOnly = true)
    public PodResponse getPodDetails(UUID shipmentId, User user) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));

        boolean isAdminOrSupport = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ADMINISTRATOR || r.getName() == RoleName.SUPPORT_AGENT);

        boolean isAssignedDriver = deliveryAssignmentRepository.findByShipmentId(shipmentId)
                .map(a -> a.getDriver().getId().equals(user.getId()))
                .orElse(false);

        boolean isCustomerOwner = shipment.getCustomer() != null && shipment.getCustomer().getId().equals(user.getId());

        if (!isAdminOrSupport && !isAssignedDriver && !isCustomerOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this Proof of Delivery");
        }

        ProofOfDelivery pod = proofOfDeliveryRepository.findByShipmentId(shipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proof of Delivery not found for this shipment"));

        return mapToPodResponse(pod, "Proof of Delivery fetched successfully");
    }

    @Transactional(readOnly = true)
    public Optional<ProofOfDelivery> getPodByShipmentId(UUID shipmentId) {
        return proofOfDeliveryRepository.findByShipmentId(shipmentId);
    }

    private PodResponse mapToPodResponse(ProofOfDelivery pod, String message) {
        return PodResponse.builder()
                .id(pod.getId())
                .shipmentId(pod.getShipment().getId())
                .trackingNumber(pod.getShipment().getTrackingNumber())
                .receiverName(pod.getReceiverName())
                .photoUrl(pod.getPhotoUrl())
                .deliveryTime(pod.getDeliveryTime())
                .message(message)
                .build();
    }
}

