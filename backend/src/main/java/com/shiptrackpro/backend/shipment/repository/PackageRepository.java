package com.shiptrackpro.backend.shipment.repository;

import com.shiptrackpro.backend.shipment.entity.Package;
import com.shiptrackpro.backend.shipment.entity.Shipment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PackageRepository extends JpaRepository<Package, UUID> {
    List<Package> findByShipment(Shipment shipment);
}
