package com.shiptrackpro.backend.admin.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<Object>>> getCustomers() {
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved", Collections.emptyList()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createCustomer(@RequestBody Object request) {
        return ResponseEntity.ok(ApiResponse.success("Customer created", new Object()));
    }
}
