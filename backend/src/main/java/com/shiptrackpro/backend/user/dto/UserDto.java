package com.shiptrackpro.backend.user.dto;

import com.shiptrackpro.backend.user.entity.AppRole;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class UserDto {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private AppRole role;
    private UUID companyId;
    private Boolean isActive;
    private ZonedDateTime lastLogin;
}
