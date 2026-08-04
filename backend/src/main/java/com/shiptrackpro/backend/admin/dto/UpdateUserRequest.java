package com.shiptrackpro.backend.admin.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private Boolean isActive;
}
