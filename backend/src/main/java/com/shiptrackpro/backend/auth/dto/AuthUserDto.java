package com.shiptrackpro.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserDto {
    private UUID id;
    private String name;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private List<String> roles;
}
