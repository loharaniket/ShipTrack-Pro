package com.shiptrackpro.backend.route.repository;

import com.shiptrackpro.backend.delivery.entity.Driver;
import com.shiptrackpro.backend.delivery.repository.DriverRepository;
import com.shiptrackpro.backend.organization.entity.Organization;
import com.shiptrackpro.backend.organization.repository.OrganizationRepository;
import com.shiptrackpro.backend.route.entity.Route;
import com.shiptrackpro.backend.route.entity.RouteStatus;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class RouteRepositoryTest {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private DriverRepository driverRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Test
    public void testSaveRouteWithAssignedStatus() {
        // Setup organization
        Organization org = new Organization();
        String uuidStr = UUID.randomUUID().toString().substring(0, 8);
        org.setName("Test Org " + uuidStr);
        org.setCode("ORG_" + uuidStr);
        org.setStatus(com.shiptrackpro.backend.organization.entity.OrganizationStatus.ACTIVE);
        org = organizationRepository.save(org);

        // Setup User
        User user = new User();
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john.doe." + UUID.randomUUID() + "@example.com");
        user.setPasswordHash("hashed_pwd");
        user.setStatus(com.shiptrackpro.backend.user.entity.UserStatus.ACTIVE);
        user = userRepository.save(user);

        // Setup Driver
        Driver driver = new Driver();
        driver.setUser(user);
        driver.setLicenseNumber("DL_" + UUID.randomUUID().toString().substring(0, 8));
        driver.setStatus("Active");
        driver.setOrganization(org);
        driver = driverRepository.save(driver);

        // Create Route with ASSIGNED status
        Route route = new Route();
        route.setName("Test Route");
        route.setOrganization(org);
        route.setDriverId(driver.getId());
        route.setStatus(RouteStatus.ASSIGNED);
        route.setTotalDistanceKm(10.5);
        route.setTotalDurationMinutes(30);

        Route savedRoute = routeRepository.save(route);
        routeRepository.flush(); // Force flush to database to trigger constraints

        assertThat(savedRoute.getId()).isNotNull();
        assertThat(savedRoute.getStatus()).isEqualTo(RouteStatus.ASSIGNED);
    }
}
