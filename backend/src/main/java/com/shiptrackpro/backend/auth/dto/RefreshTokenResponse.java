package com.shiptrackpro.backend.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RefreshTokenResponse {
    private String accessToken;
    private String tokenType;
    private long expiresIn;
}
