package com.shiptrackpro.backend.delivery.repository;

import com.shiptrackpro.backend.delivery.entity.Vehicle;
import com.shiptrackpro.backend.delivery.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    List<Vehicle> findAllByStatus(VehicleStatus status);
}
