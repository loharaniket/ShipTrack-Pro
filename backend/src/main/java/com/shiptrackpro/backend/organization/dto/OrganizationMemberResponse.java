package com.shiptrackpro.backend.organization.dto;

import com.shiptrackpro.backend.user.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationMemberResponse {
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private List<String> roles;
    private UserStatus status;
    private ZonedDateTime joinedAt;
}
