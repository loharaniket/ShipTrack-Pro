package com.shiptrackpro.backend.user.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private Boolean isActive;
}
