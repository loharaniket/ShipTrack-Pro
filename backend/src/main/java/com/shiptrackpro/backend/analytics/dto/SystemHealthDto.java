package com.shiptrackpro.backend.analytics.dto;

import lombok.Data;
import java.util.Map;

@Data
public class SystemHealthDto {
    private String status;
    private Map<String, String> servicesStatus;
}
