/*
 * Komentar projekta: Service sloj koji sadrzi poslovnu logiku i koordinise repository-je, validacije i spoljasnje servise.
 */

package mf.fit.service;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import mf.fit.dto.AuthResponse;
import mf.fit.dto.ErrorResponse;
import mf.fit.dto.LoginRequest;
import mf.fit.dto.RegisterRequest;
import mf.fit.dto.UserProfileResponse;
import mf.fit.entity.Stan;
import mf.fit.entity.Stanar;
import mf.fit.entity.Ulaz;
import mf.fit.entity.Zgrada;
import mf.fit.repository.StanRepository;
import mf.fit.repository.StanarRepository;
import mf.fit.repository.UlazRepository;
import mf.fit.repository.ZgradaRepository;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@ApplicationScoped
public class AccountService {

    @Inject
    KeycloakService keycloakService;

    @Inject
    StanarRepository stanarRepository;

    @Inject
    StanRepository stanRepository;

    @Inject
    ZgradaRepository zgradaRepository;

    @Inject
    UlazRepository ulazRepository;

    @Inject
    UserProfileService userProfileService;

    @Inject
    DemoPasswordService demoPasswordService;

    @ConfigProperty(name = "app.auth.demo-login.enabled", defaultValue = "true")
    boolean demoLoginEnabled;

    @ConfigProperty(name = "app.auth.demo-password", defaultValue = "Demo12345!")
    String demoPassword;

    @Transactional
    public UserProfileResponse register(RegisterRequest request) {
        validateRegisterRequest(request);

        String email = request.email().trim().toLowerCase();
        if (stanarRepository.findByEmail(email) != null) {
            throw apiError("Nalog sa ovim emailom vec postoji. Prijavite se ili koristite drugi email.", 409);
        }

        Stan stan = resolveResidentialSelection(request);

        int roleCode = request.roleCode() == null ? 1 : request.roleCode();
        if (roleCode == 2 && stan == null) {
            throw apiError("Starjesina mora biti povezan sa ulazom", 400);
        }
        if (roleCode == 2 && stanarRepository.findStarjesinaByUlazId(stan.getUlaz().getId()) != null) {
            throw apiError("Ovaj ulaz vec ima starjesinu", 409);
        }

        String roleName = roleCode == 2 ? "starjesina" : "stanar";
        String keycloakId = null;
        boolean localDemoAccount = false;

        try {
            keycloakId = keycloakService.createUser(email, request.password(), roleName);
        } catch (WebApplicationException e) {
            if (!demoLoginEnabled) {
                throw e;
            }
            localDemoAccount = true;
            keycloakId = "demo-local-" + email;
        }

        Stanar stanar = new Stanar();
        stanar.setEmail(email);
        stanar.setUsername(email);
        stanar.setPassword(localDemoAccount ? demoPasswordService.hash(email, request.password()) : null);
        stanar.setKeycloakId(keycloakId);
        stanar.setIme(clean(request.ime()));
        stanar.setPrezime(clean(request.prezime()));
        stanar.setBrTelefona(clean(request.brTelefona()));
        stanar.setTipNaloga(roleCode);
        stanar.setStarjesina(roleCode == 2);
        stanar.setStan(stan);
        stanarRepository.save(stanar);

        return userProfileService.toResponse(stanar);
    }

    public AuthResponse login(LoginRequest request) {
        if (request == null || isBlank(request.email()) || isBlank(request.password())) {
            throw apiError("Email i password su obavezni", 400);
        }

        String email = request.email().trim().toLowerCase();
        try {
            return keycloakLogin(email, request.password());
        } catch (WebApplicationException e) {
            if (!demoLoginEnabled) {
                throw e;
            }
            return demoLogin(email, request.password());
        }
    }

    private AuthResponse keycloakLogin(String email, String password) {
        JsonNode token = keycloakService.login(email, password);
        Stanar stanar = stanarRepository.findByEmail(email);
        UserProfileResponse profile;

        if (stanar != null) {
            profile = userProfileService.toResponse(stanar);
        } else if (keycloakService.accessTokenHasRole(token, "admin")) {
            profile = userProfileService.adminProfile(email);
        } else {
            throw apiError("Nalog postoji u Keycloak-u, ali nema lokalni profil aplikacije", 403);
        }

        return new AuthResponse(
                token.path("access_token").asText(),
                token.path("refresh_token").asText(null),
                token.path("token_type").asText("Bearer"),
                token.path("expires_in").asLong(0),
                profile
        );
    }

    private AuthResponse demoLogin(String email, String password) {
        Stanar stanar = stanarRepository.findByEmail(email);
        if (stanar == null || !demoPasswordService.matches(email, password, stanar.getPassword())) {
            throw apiError("Email ili password nijesu ispravni", 401);
        }

        String basicPrincipal = switch (stanar.getTipNaloga() == null ? 1 : stanar.getTipNaloga()) {
            case 99 -> "admin";
            case 2 -> "starjesina";
            default -> "stanar";
        };

        return new AuthResponse(
                basicToken(basicPrincipal, demoPassword),
                null,
                "Basic",
                86400,
                userProfileService.toResponse(stanar)
        );
    }

    private String basicToken(String username, String password) {
        String value = username + ":" + password;
        return "Basic " + Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private void validateRegisterRequest(RegisterRequest request) {
        if (request == null) {
            throw apiError("Podaci za registraciju su obavezni", 400);
        }
        if (isBlank(request.email()) || !request.email().contains("@")) {
            throw apiError("Email nije validan", 400);
        }
        if (isBlank(request.password()) || request.password().length() < 8) {
            throw apiError("Password mora imati najmanje 8 karaktera", 400);
        }
        if (!request.password().equals(request.confirmPassword())) {
            throw apiError("Password i potvrda passworda se ne poklapaju", 400);
        }
        if (isWeakPassword(request.password())) {
            throw apiError("Password mora imati veliko slovo, malo slovo, broj i specijalni karakter", 400);
        }
        if (request.roleCode() != null && request.roleCode() != 1 && request.roleCode() != 2) {
            throw apiError("Uloga mora biti stanar ili starjesina ulaza", 400);
        }
        if (isBlank(request.ime()) || isBlank(request.prezime())) {
            throw apiError("Ime i prezime su obavezni", 400);
        }
        if (!hasId(request.ulazId())) {
            throw apiError("Ulaz je obavezan", 400);
        }
        if (!hasId(request.stanId())) {
            throw apiError("Stan je obavezan", 400);
        }
    }

    private boolean isWeakPassword(String password) {
        return password.chars().noneMatch(Character::isUpperCase)
                || password.chars().noneMatch(Character::isLowerCase)
                || password.chars().noneMatch(Character::isDigit)
                || password.chars().noneMatch(ch -> !Character.isLetterOrDigit(ch));
    }

    private Stan resolveResidentialSelection(RegisterRequest request) {
        if (hasId(request.stanId())) {
            Stan stan = stanRepository.findById(request.stanId());
            if (stan == null || stan.getUlaz() == null || stan.getUlaz().getZgrada() == null) {
                throw apiError("Morate izabrati validnu zgradu, ulaz i stan", 400);
            }
            if (hasId(request.ulazId()) && !request.ulazId().equals(stan.getUlaz().getId())) {
                throw apiError("Izabrani stan ne pripada izabranom ulazu", 400);
            }
            return stan;
        }

        Ulaz ulaz = resolveUlaz(request);
        Stan existing = stanRepository.findByUlazAndBroj(ulaz.getId(), request.brojStana());
        if (existing != null) {
            return existing;
        }

        Stan stan = new Stan();
        stan.setBrojStana(request.brojStana());
        stan.setImeVlasnikaStana(optionalClean(request.imeVlasnikaStana()));
        stan.setUlaz(ulaz);
        stanRepository.save(stan);
        return stan;
    }

    private Ulaz resolveUlaz(RegisterRequest request) {
        if (hasId(request.ulazId())) {
            Ulaz ulaz = ulazRepository.findById(request.ulazId());
            if (ulaz == null || ulaz.getZgrada() == null) {
                throw apiError("Ulaz nije validan", 400);
            }
            if (hasId(request.zgradaId()) && !request.zgradaId().equals(ulaz.getZgrada().getId())) {
                throw apiError("Ulaz ne pripada izabranoj zgradi", 400);
            }
            return ulaz;
        }

        Zgrada zgrada = resolveZgrada(request);
        Ulaz existing = ulazRepository.findByZgradaAndIdentifier(
                zgrada.getId(),
                request.brojUlaza(),
                request.nazivUlaza()
        );
        if (existing != null) {
            return existing;
        }

        String brojUlaza = firstPresent(request.brojUlaza(), request.nazivUlaza());
        Ulaz ulaz = new Ulaz();
        ulaz.setBrojUlaza(brojUlaza);
        ulaz.setNazivUlaza(optionalClean(request.nazivUlaza()));
        ulaz.setBrojZiroRacuna(optionalClean(request.brojZiroRacuna()));
        ulaz.setZgrada(zgrada);
        ulazRepository.save(ulaz);
        return ulaz;
    }

    private Zgrada resolveZgrada(RegisterRequest request) {
        if (hasId(request.zgradaId())) {
            Zgrada zgrada = zgradaRepository.findById(request.zgradaId());
            if (zgrada == null) {
                throw apiError("Zgrada nije validna", 400);
            }
            return zgrada;
        }

        String grad = requiredClean(request.grad(), "Grad je obavezan");
        String naziv = requiredClean(request.zgradaNaziv(), "Naziv zgrade je obavezan");
        String naselje = optionalClean(request.naselje());

        Zgrada existing = zgradaRepository.findByLocationAndNaziv(grad, naselje, naziv);
        if (existing != null) {
            return existing;
        }

        Zgrada zgrada = new Zgrada();
        zgrada.setGrad(grad);
        zgrada.setNaselje(naselje);
        zgrada.setNaziv(naziv);
        zgrada.setVlasnik(optionalClean(request.zgradaVlasnik()));
        zgradaRepository.save(zgrada);
        return zgrada;
    }

    private boolean hasId(Long value) {
        return value != null && value > 0;
    }

    private String firstPresent(String primary, String fallback) {
        String value = optionalClean(primary);
        return value == null ? requiredClean(fallback, "Ulaz je obavezan") : value;
    }

    private String requiredClean(String value, String message) {
        if (isBlank(value)) {
            throw apiError(message, 400);
        }
        return value.trim();
    }

    private WebApplicationException apiError(String message, int status) {
        return new WebApplicationException(Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ErrorResponse(message))
                .build());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private String optionalClean(String value) {
        return isBlank(value) ? null : value.trim();
    }
}

