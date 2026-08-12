package com.shiptrackpro.backend.auth.dto;

import lombok.Data;

@Data
public class OAuth2LoginRequest {
    private String provider;
    private String code;
}
