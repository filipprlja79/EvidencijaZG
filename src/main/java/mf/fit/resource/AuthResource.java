package mf.fit.resource;

import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import io.quarkus.security.identity.SecurityIdentity;
import mf.fit.dto.AuthResponse;
import mf.fit.dto.DemoAccountResponse;
import mf.fit.dto.LoginRequest;
import mf.fit.dto.RegisterRequest;
import mf.fit.dto.UserProfileResponse;
import mf.fit.entity.Stanar;
import mf.fit.repository.StanarRepository;
import mf.fit.service.AccountService;
import mf.fit.service.DemoDataInitializer;
import mf.fit.service.UserProfileService;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.List;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AccountService accountService;

    @Inject
    StanarRepository stanarRepository;

    @Inject
    UserProfileService userProfileService;

    @Inject
    SecurityIdentity identity;

    @ConfigProperty(name = "app.auth.demo-password", defaultValue = "Demo12345!")
    String demoPassword;

    @ConfigProperty(name = "app.auth.demo-login.enabled", defaultValue = "true")
    boolean demoLoginEnabled;

    @POST
    @Path("/register")
    @PermitAll
    public UserProfileResponse register(RegisterRequest request) {
        return accountService.register(request);
    }

    @POST
    @Path("/login")
    @PermitAll
    public AuthResponse login(LoginRequest request) {
        return accountService.login(request);
    }

    @GET
    @Path("/demo-accounts")
    @PermitAll
    public List<DemoAccountResponse> demoAccounts() {
        if (!demoLoginEnabled) {
            return List.of();
        }
        return List.of(
                new DemoAccountResponse(DemoDataInitializer.ADMIN_EMAIL, demoPassword, "admin", "Admin"),
                new DemoAccountResponse(DemoDataInitializer.STARJESINA_EMAIL, demoPassword, "starjesina", "Starjesina ulaza"),
                new DemoAccountResponse(DemoDataInitializer.STANAR_EMAIL, demoPassword, "stanar", "Stanar")
        );
    }

    @GET
    @Path("/me")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public UserProfileResponse me() {
        String principal = identity.getPrincipal().getName();
        Stanar stanar = stanarRepository.findByKeycloakId(principal);
        if (stanar == null) {
            stanar = stanarRepository.findByUsername(principal);
        }
        if (stanar != null) {
            return userProfileService.toResponse(stanar);
        }
        if (identity.hasRole("admin")) {
            return userProfileService.adminProfile(principal);
        }
        throw new WebApplicationException("Lokalni profil nije pronadjen", 404);
    }
}
