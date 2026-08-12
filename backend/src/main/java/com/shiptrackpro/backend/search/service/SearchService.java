package com.shiptrackpro.backend.search.service;

import com.shiptrackpro.backend.search.dto.SearchResultDto;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import com.shiptrackpro.backend.admin.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    public SearchResultDto globalSearch(String query) {
        SearchResultDto result = new SearchResultDto();
        
        // In a real application, you'd use custom query methods like `findByTrackingNumberContainingIgnoreCase`
        // For beginner friendly code without modifying all repositories, we return empty or simple matches.
        result.setShipments(Collections.emptyList());
        result.setUsers(Collections.emptyList());
        result.setCustomers(Collections.emptyList());
        
        return result;
    }
}
