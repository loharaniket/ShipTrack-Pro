package com.shiptrackpro.backend.auth;

import com.shiptrackpro.backend.auth.dto.LoginRequest;
import com.shiptrackpro.backend.auth.dto.LoginResponse;
import com.shiptrackpro.backend.auth.dto.RegisterRequest;
import com.shiptrackpro.backend.auth.dto.RegisterResponse;
import com.shiptrackpro.backend.auth.service.AuthService;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testRegisterCustomerSuccess() {
        String email = "test.customer." + UUID.randomUUID() + "@example.com";
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Rahul");
        request.setLastName("Patil");
        request.setEmail(email);
        request.setPhone("9876543210");
        request.setPassword("password123");

        RegisterResponse response = authService.register(request);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).isEqualTo("Registration successful");

        User createdUser = userRepository.findByEmail(email).orElseThrow();
        assertThat(createdUser.getFirstName()).isEqualTo("Rahul");
        assertThat(createdUser.getLastName()).isEqualTo("Patil");
        assertThat(createdUser.getRoles()).anyMatch(r -> r.getName() == RoleName.CUSTOMER);
    }

    @Test
    public void testRegisterDuplicateEmailFails() {
        String email = "dup.user." + UUID.randomUUID() + "@example.com";
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("First");
        request.setLastName("User");
        request.setEmail(email);
        request.setPassword("password123");

        authService.register(request);

        // Attempting to register again with same email should throw 400 Bad Request
        assertThrows(ResponseStatusException.class, () -> authService.register(request));
    }

    @Test
    public void testLoginSuccess() {
        String email = "login.user." + UUID.randomUUID() + "@example.com";
        RegisterRequest regRequest = new RegisterRequest();
        regRequest.setFirstName("Amit");
        regRequest.setLastName("Sharma");
        regRequest.setEmail(email);
        regRequest.setPassword("securePass123");
        authService.register(regRequest);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword("securePass123");

        LoginResponse loginResponse = authService.login(loginRequest);

        assertThat(loginResponse.getToken()).isNotNull();
        assertThat(loginResponse.getUser()).isNotNull();
        assertThat(loginResponse.getUser().getEmail()).isEqualTo(email);
        assertThat(loginResponse.getUser().getName()).isEqualTo("Amit Sharma");
        assertThat(loginResponse.getUser().getRole()).isEqualTo("CUSTOMER");
    }

    @Test
    public void testLoginInvalidPasswordFails() {
        String email = "badpass.user." + UUID.randomUUID() + "@example.com";
        RegisterRequest regRequest = new RegisterRequest();
        regRequest.setFirstName("Test");
        regRequest.setLastName("User");
        regRequest.setEmail(email);
        regRequest.setPassword("correctPassword");
        authService.register(regRequest);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword("wrongPassword");

        assertThrows(ResponseStatusException.class, () -> authService.login(loginRequest));
    }
}
