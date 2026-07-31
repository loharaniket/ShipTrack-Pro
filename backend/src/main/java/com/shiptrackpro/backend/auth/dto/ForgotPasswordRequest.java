package com.shiptrackpro.backend.auth.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
}
