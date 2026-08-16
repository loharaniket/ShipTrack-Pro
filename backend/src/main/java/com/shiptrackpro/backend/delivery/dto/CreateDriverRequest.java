package com.shiptrackpro.backend.delivery.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDriverRequest {
    @NotBlank(message = "Driver name is required")
    private String name;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    private String vehicleRegistration;
    private String vehicleType = "Van";
    private Double vehicleCapacityKg = 500.0;
    private String licenseNumber;
    private Integer experienceYears = 1;
    private String status = "Active";
}
