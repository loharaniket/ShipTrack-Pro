package com.shiptrackpro.backend.shipment.service;

import com.shiptrackpro.backend.address.entity.Address;
import com.shiptrackpro.backend.address.service.AddressService;
import com.shiptrackpro.backend.notifications.service.NotificationService;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.dto.CustomerShipmentDto;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.tracking.entity.ShipmentTracking;
import com.shiptrackpro.backend.tracking.repository.ShipmentTrackingRepository;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentTrackingRepository shipmentTrackingRepository;
    private final NotificationService notificationService;
    private final AddressService addressService;

    @Transactional
    public CreateShipmentResponse createShipment(CreateShipmentRequest request, User customer) {
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }

        // 1. Resolve Origin Address
        Address originAddress;
        if (request.getOriginAddress() != null) {
            originAddress = addressService.findOrCreateAddress(request.getOriginAddress());
        } else if (request.getPickupAddress() != null && !request.getPickupAddress().trim().isEmpty()) {
            originAddress = addressService.findOrCreateFromRaw(request.getPickupAddress());
        } else {
            originAddress = addressService.findOrCreateFromRaw("Origin Location");
        }

        // 2. Resolve Destination Address
        Address destinationAddress;
        if (request.getDestinationAddress() != null) {
            destinationAddress = addressService.findOrCreateAddress(request.getDestinationAddress());
        } else if (request.getDeliveryAddress() != null && !request.getDeliveryAddress().trim().isEmpty()) {
            destinationAddress = addressService.findOrCreateFromRaw(request.getDeliveryAddress());
        } else {
            destinationAddress = addressService.findOrCreateFromRaw("Delivery Location");
        }

        String pickupStr = request.getPickupAddress() != null && !request.getPickupAddress().trim().isEmpty()
                ? request.getPickupAddress()
                : (originAddress != null ? originAddress.getLine1() : "Origin Location");

        String deliveryStr = request.getDeliveryAddress() != null && !request.getDeliveryAddress().trim().isEmpty()
                ? request.getDeliveryAddress()
                : (destinationAddress != null ? destinationAddress.getLine1() : "Delivery Location");

        // Generate unique sequential tracking number (e.g. STP10001)
        String trackingNumber = generateTrackingNumber();

        Shipment shipment = Shipment.builder()
                .trackingNumber(trackingNumber)
                .customer(customer)
                .senderName(request.getSenderName())
                .senderPhone(request.getSenderPhone())
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .pickupAddress(pickupStr)
                .deliveryAddress(deliveryStr)
                .originAddress(originAddress)
                .destinationAddress(destinationAddress)
                .packageDescription(request.getPackageDescription())
                .weight(request.getWeight())
                .status(ShipmentStatus.CREATED)
                .build();

        Shipment savedShipment = shipmentRepository.save(shipment);

        // Transactionally create initial tracking history
        ShipmentTracking initialTracking = ShipmentTracking.builder()
                .shipment(savedShipment)
                .status(ShipmentStatus.CREATED)
                .description("Shipment created")
                .updatedBy(customer.getFirstName() + " " + customer.getLastName())
                .build();
        shipmentTrackingRepository.save(initialTracking);

        // Transactionally create in-app notification for the customer
        notificationService.createNotification(
                customer,
                "Shipment Created",
                "Your shipment with tracking number " + trackingNumber + " has been successfully created.",
                "SHIPMENT_CREATED"
        );

        return CreateShipmentResponse.builder()
                .id(savedShipment.getId())
                .message("Shipment created")
                .trackingNumber(trackingNumber)
                .status(savedShipment.getStatus().name())
                .build();
    }

    @Transactional(readOnly = true)
    public List<CustomerShipmentDto> getCustomerShipments(User customer) {
        return shipmentRepository.findAllByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(this::mapToCustomerShipmentDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerShipmentDto getCustomerShipmentById(UUID id, User user) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));

        boolean isAdminOrSupport = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ADMINISTRATOR || r.getName() == RoleName.SUPPORT_AGENT);

        boolean isDriver = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.DRIVER);

        boolean isOwner = shipment.getCustomer() != null && shipment.getCustomer().getId().equals(user.getId());

        if (!isAdminOrSupport && !isDriver && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this shipment");
        }

        return mapToCustomerShipmentDto(shipment);
    }

    @Transactional(readOnly = true)
    public CustomerShipmentDto getShipmentByTrackingNumber(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found with tracking number: " + trackingNumber));
        return mapToCustomerShipmentDto(shipment);
    }

    @Transactional(readOnly = true)
    public Page<CustomerShipmentDto> getAllShipments(Pageable pageable) {
        return shipmentRepository.findAll(pageable).map(this::mapToCustomerShipmentDto);
    }

    @Transactional(readOnly = true)
    public List<CustomerShipmentDto> getPendingShipments() {
        return shipmentRepository.findAllByStatus(ShipmentStatus.CREATED)
                .stream()
                .map(this::mapToCustomerShipmentDto)
                .collect(Collectors.toList());
    }

    private String generateTrackingNumber() {
        try {
            Long nextSeq = shipmentRepository.getNextShipmentSequence();
            return "STP" + nextSeq;
        } catch (Exception e) {
            return "STP" + (System.currentTimeMillis() % 1000000);
        }
    }

    public CustomerShipmentDto mapToCustomerShipmentDto(Shipment shipment) {
        return CustomerShipmentDto.builder()
                .id(shipment.getId())
                .trackingNumber(shipment.getTrackingNumber())
                .customerId(shipment.getCustomer() != null ? shipment.getCustomer().getId() : null)
                .customerName(shipment.getCustomer() != null ? 
                        shipment.getCustomer().getFirstName() + " " + shipment.getCustomer().getLastName() : shipment.getSenderName())
                .senderName(shipment.getSenderName())
                .senderPhone(shipment.getSenderPhone())
                .receiverName(shipment.getReceiverName())
                .receiverPhone(shipment.getReceiverPhone())
                .pickupAddress(shipment.getPickupAddress())
                .deliveryAddress(shipment.getDeliveryAddress())
                .originAddress(shipment.getOriginAddress() != null ? addressService.toDto(shipment.getOriginAddress()) : null)
                .destinationAddress(shipment.getDestinationAddress() != null ? addressService.toDto(shipment.getDestinationAddress()) : null)
                .packageDescription(shipment.getPackageDescription())
                .weight(shipment.getWeight())
                .status(shipment.getStatus())
                .createdAt(shipment.getCreatedAt())
                .updatedAt(shipment.getUpdatedAt())
                .build();
    }
}
