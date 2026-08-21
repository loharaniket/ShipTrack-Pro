package com.shiptrackpro.backend.address.repository;

import com.shiptrackpro.backend.address.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findByCityIgnoreCase(String city);

    List<Address> findByPostalCode(String postalCode);
}
