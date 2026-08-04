package com.shiptrackpro.backend.user.dto;

import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    private String firstName;
    private String lastName;
}
