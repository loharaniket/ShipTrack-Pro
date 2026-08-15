package com.shiptrackpro.backend.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String status;
    private List<String> roles;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
