package com.shiptrackpro.backend.search.dto;

import lombok.Data;
import java.util.List;

@Data
public class SearchResultDto {
    private List<Object> shipments;
    private List<Object> users;
    private List<Object> customers;
}
