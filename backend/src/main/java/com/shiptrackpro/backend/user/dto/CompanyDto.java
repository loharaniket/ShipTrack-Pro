package com.shiptrackpro.backend.user.dto;

import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class CompanyDto {
    private UUID id;
    private String companyName;
    private String email;
    private String phone;
    private String website;
    private ZonedDateTime createdAt;
}
