package com.shiptrackpro.backend.admin.dto;

import lombok.Data;

@Data
public class CreateCompanyRequest {
    private String companyName;
    private String email;
    private String phone;
    private String website;
}
