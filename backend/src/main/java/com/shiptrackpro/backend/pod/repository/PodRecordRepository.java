package com.shiptrackpro.backend.pod.repository;

import com.shiptrackpro.backend.pod.entity.PodRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PodRecordRepository extends JpaRepository<PodRecord, UUID> {
}
