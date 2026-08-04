package com.shiptrackpro.backend.user.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.user.dto.UpdateUserProfileRequest;
import com.shiptrackpro.backend.user.dto.UserDto;
import com.shiptrackpro.backend.user.service.UserService;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserDto>> getProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", userService.getProfile(auth)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<String>> updateMyProfile(Authentication auth,
            @RequestBody UpdateUserProfileRequest UpdateUserProfileRequest) {
        userService.updateMyProfile(UpdateUserProfileRequest, auth);
        return ResponseEntity.ok(ApiResponse.success("Profile Update Successfully",null));
    }
}
