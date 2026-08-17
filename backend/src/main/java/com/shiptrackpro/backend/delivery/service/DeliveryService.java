package com.shiptrackpro.backend.delivery.service;

import com.shiptrackpro.backend.delivery.entity.DeliveryAssignment;
import com.shiptrackpro.backend.delivery.repository.DeliveryAssignmentRepository;
import com.shiptrackpro.backend.notifications.service.NotificationService;
import com.shiptrackpro.backend.shipment.dto.CustomerShipmentDto;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.tracking.entity.ShipmentTracking;
import com.shiptrackpro.backend.tracking.repository.ShipmentTrackingRepository;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentTrackingRepository shipmentTrackingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ShipmentService shipmentService;

    @Transactional
    public DeliveryAssignment assignShipment(UUID shipmentId, UUID driverId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));

        if (shipment.getStatus() != ShipmentStatus.CREATED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shipment is not in CREATED status");
        }

        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found"));

        boolean isDriver = driver.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.DRIVER);
        if (!isDriver) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected user does not have DRIVER role");
        }

        DeliveryAssignment assignment = DeliveryAssignment.builder()
                .shipment(shipment)
                .driver(driver)
                .status("ASSIGNED")
                .build();
        assignment = deliveryAssignmentRepository.save(assignment);

        // Transactionally update shipment status
        shipment.setStatus(ShipmentStatus.ASSIGNED);
        shipmentRepository.save(shipment);

        // Transactionally add tracking record
        ShipmentTracking tracking = ShipmentTracking.builder()
                .shipment(shipment)
                .status(ShipmentStatus.ASSIGNED)
                .description("Driver assigned for delivery: " + driver.getFirstName() + " " + driver.getLastName())
                .updatedBy("System / Admin")
                .build();
        shipmentTrackingRepository.save(tracking);

        // Create notifications for customer and driver
        if (shipment.getCustomer() != null) {
            notificationService.createNotification(
                    shipment.getCustomer(),
                    "Driver Assigned",
                    "A delivery driver (" + driver.getFirstName() + ") has been assigned to your shipment " + shipment.getTrackingNumber(),
                    "SHIPMENT_ASSIGNED"
            );
        }
        notificationService.createNotification(
                driver,
                "New Delivery Assigned",
                "You have been assigned shipment " + shipment.getTrackingNumber(),
                "NEW_ASSIGNMENT"
        );

        return assignment;
    }

    @Transactional(readOnly = true)
    public List<CustomerShipmentDto> getDriverDeliveries(User driver) {
        return deliveryAssignmentRepository.findByDriverIdOrderByAssignedDateDesc(driver.getId())
                .stream()
                .map(DeliveryAssignment::getShipment)
                .map(shipmentService::mapToCustomerShipmentDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<User> getDrivers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == RoleName.DRIVER))
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerShipmentDto updateShipmentStatus(UUID shipmentId, ShipmentStatus targetStatus, String description, User user) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));

        // Validate that DELIVERED is NOT allowed via this direct status endpoint
        if (targetStatus == ShipmentStatus.DELIVERED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "DELIVERED status can only be updated via Proof of Delivery (POD) upload");
        }

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

        // Validate sequential status flow: ASSIGNED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY
        ShipmentStatus currentStatus = shipment.getStatus();
        boolean isValidTransition = false;
        if (currentStatus == ShipmentStatus.ASSIGNED && targetStatus == ShipmentStatus.PICKED_UP) {
            isValidTransition = true;
        } else if (currentStatus == ShipmentStatus.PICKED_UP && targetStatus == ShipmentStatus.IN_TRANSIT) {
            isValidTransition = true;
        } else if (currentStatus == ShipmentStatus.IN_TRANSIT && targetStatus == ShipmentStatus.OUT_FOR_DELIVERY) {
            isValidTransition = true;
        }

        if (!isValidTransition) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status transition from " + currentStatus + " to " + targetStatus);
        }

        // Update shipment status
        shipment.setStatus(targetStatus);
        Shipment updated = shipmentRepository.save(shipment);

        // Append tracking record
        String updatedByName = user.getFirstName() + " " + user.getLastName();
        String trackingDesc = (description != null && !description.isBlank())
                ? description
                : "Status updated to " + targetStatus;

        ShipmentTracking tracking = ShipmentTracking.builder()
                .shipment(updated)
                .status(targetStatus)
                .description(trackingDesc)
                .updatedBy(updatedByName)
                .build();
        shipmentTrackingRepository.save(tracking);

        // Notify customer
        if (updated.getCustomer() != null) {
            notificationService.createNotification(
                    updated.getCustomer(),
                    "Shipment Status Updated: " + targetStatus,
                    "Your shipment " + updated.getTrackingNumber() + " is now " + targetStatus + ". " + trackingDesc,
                    "SHIPMENT_STATUS_UPDATE"
            );
        }

        return shipmentService.mapToCustomerShipmentDto(updated);
    }

    public com.shiptrackpro.backend.admin.dto.AssignmentResponse mapToAssignmentResponse(DeliveryAssignment assignment) {
        return com.shiptrackpro.backend.admin.dto.AssignmentResponse.builder()
                .id(assignment.getId())
                .shipmentId(assignment.getShipment().getId())
                .trackingNumber(assignment.getShipment().getTrackingNumber())
                .driverId(assignment.getDriver().getId())
                .driverName(assignment.getDriver().getFirstName() + " " + assignment.getDriver().getLastName())
                .status(assignment.getStatus())
                .assignedDate(assignment.getAssignedDate())
                .message("Driver assigned successfully")
                .build();
    }
}
