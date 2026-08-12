package com.shiptrackpro.backend.support.repository;

import com.shiptrackpro.backend.support.entity.SupportEscalation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SupportEscalationRepository extends JpaRepository<SupportEscalation, UUID> {
}
