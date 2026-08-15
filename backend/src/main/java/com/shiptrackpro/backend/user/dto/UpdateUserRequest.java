package com.shiptrackpro.backend.user.dto;

import lombok.Data;

import java.util.List;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String status;
    private List<String> roles;
}
