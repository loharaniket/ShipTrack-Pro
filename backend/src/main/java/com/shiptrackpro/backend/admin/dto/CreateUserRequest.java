package com.shiptrackpro.backend.admin.dto;

import com.shiptrackpro.backend.user.entity.AppRole;
import lombok.Data;
import java.util.UUID;

@Data
public class CreateUserRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private AppRole role;
    private UUID companyId;
}
