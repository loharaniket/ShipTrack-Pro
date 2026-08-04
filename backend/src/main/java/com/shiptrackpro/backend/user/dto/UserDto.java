package com.shiptrackpro.backend.user.dto;

import com.shiptrackpro.backend.user.entity.AppRole;

import lombok.Builder;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Builder
@Data
public class UserDto {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private AppRole role;
    private String companyName;
    private Boolean isActive;
    private ZonedDateTime lastLogin;
}
