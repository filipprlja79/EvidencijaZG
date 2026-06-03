/*
 * Komentar projekta: Service sloj koji sadrzi poslovnu logiku i koordinise repository-je, validacije i spoljasnje servise.
 */

package mf.fit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@ApplicationScoped
public class KeycloakService {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Inject
    ObjectMapper mapper;

    @ConfigProperty(name = "app.keycloak.base-url", defaultValue = "http://localhost:8180")
    String baseUrl;

    @ConfigProperty(name = "app.keycloak.realm", defaultValue = "filipprlja")
    String realm;

    @ConfigProperty(name = "app.keycloak.auth-server-url", defaultValue = "http://localhost:8180/realms/filipprlja")
    String authServerUrl;

    @ConfigProperty(name = "app.keycloak.frontend-client-id", defaultValue = "moja-zgrada-frontend")
    String frontendClientId;

    @ConfigProperty(name = "app.keycloak.frontend-client-secret", defaultValue = "")
    Optional<String> frontendClientSecret;

    @ConfigProperty(name = "app.keycloak.backend-client-id", defaultValue = "moja-zgrada-backend")
    String backendClientId;

    @ConfigProperty(name = "app.keycloak.backend-client-secret", defaultValue = "")
    Optional<String> backendClientSecret;

    public JsonNode login(String email, String password) {
        Map<String, String> form = new HashMap<>();
        form.put("grant_type", "password");
        form.put("client_id", frontendClientId);
        form.put("username", email);
        form.put("password", password);
        if (frontendClientSecret.isPresent() && !frontendClientSecret.get().isBlank()) {
            form.put("client_secret", frontendClientSecret.get());
        }

        return postForm(tokenEndpoint(), form, "Keycloak login nije uspio");
    }

    public String createUser(String email, String password, String roleName) {
        String token = adminAccessToken();

        Optional<String> existingUserId = findUserIdByEmail(email, token);
        if (existingUserId.isPresent()) {
            throw new WebApplicationException("Korisnik sa ovim emailom vec postoji u Keycloak-u", 409);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("username", email);
        payload.put("email", email);
        payload.put("enabled", true);
        payload.put("emailVerified", false);
        payload.put("credentials", List.of(Map.of(
                "type", "password",
                "value", password,
                "temporary", false
        )));

        HttpResponse<String> response = send(jsonRequest(adminUsersEndpoint())
                .header("Authorization", "Bearer " + token)
                .POST(jsonBody(payload))
                .build(), "Kreiranje Keycloak korisnika nije uspjelo");

        if (response.statusCode() != 201 && response.statusCode() != 204) {
            throw keycloakError("Kreiranje Keycloak korisnika nije uspjelo", response);
        }

        String userId = response.headers()
                .firstValue("Location")
                .map(location -> location.substring(location.lastIndexOf('/') + 1))
                .orElseGet(() -> findUserIdByEmail(email, token)
                        .orElseThrow(() -> new WebApplicationException("Keycloak korisnik je kreiran, ali ID nije pronadjen", 502)));

        assignRealmRole(userId, roleName, token);
        return userId;
    }

    public boolean accessTokenHasRole(JsonNode tokenResponse, String roleName) {
        String accessToken = tokenResponse.path("access_token").asText("");
        if (accessToken.isBlank()) {
            return false;
        }

        try {
            String[] parts = accessToken.split("\\.");
            if (parts.length < 2) {
                return false;
            }
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            JsonNode tokenPayload = mapper.readTree(payload);
            JsonNode roles = tokenPayload.path("realm_access").path("roles");
            if (!roles.isArray()) {
                return false;
            }
            for (JsonNode role : roles) {
                if (roleName.equals(role.asText())) {
                    return true;
                }
            }
            return false;
        } catch (RuntimeException | IOException e) {
            return false;
        }
    }

    private String adminAccessToken() {
        String secret = backendClientSecret.orElse("");
        if (secret.isBlank()) {
            throw new WebApplicationException("Nedostaje KEYCLOAK_BACKEND_CLIENT_SECRET konfiguracija", 503);
        }

        Map<String, String> form = new HashMap<>();
        form.put("grant_type", "client_credentials");
        form.put("client_id", backendClientId);
        form.put("client_secret", secret);

        JsonNode response = postForm(tokenEndpoint(), form, "Keycloak admin token nije dostupan");
        String accessToken = response.path("access_token").asText("");
        if (accessToken.isBlank()) {
            throw new WebApplicationException("Keycloak nije vratio admin access token", 502);
        }
        return accessToken;
    }

    private Optional<String> findUserIdByEmail(String email, String token) {
        String uri = adminUsersEndpoint() + "?email=" + encode(email) + "&exact=true";
        HttpResponse<String> response = send(HttpRequest.newBuilder(URI.create(uri))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build(), "Provjera Keycloak korisnika nije uspjela");

        if (response.statusCode() >= 400) {
            throw keycloakError("Provjera Keycloak korisnika nije uspjela", response);
        }

        try {
            JsonNode users = mapper.readTree(response.body());
            if (users.isArray() && !users.isEmpty()) {
                return Optional.of(users.get(0).path("id").asText());
            }
            return Optional.empty();
        } catch (IOException e) {
            throw new WebApplicationException("Neispravan Keycloak odgovor", 502);
        }
    }

    private void assignRealmRole(String userId, String roleName, String token) {
        HttpResponse<String> roleResponse = send(HttpRequest.newBuilder(URI.create(adminRealmRoleEndpoint(roleName)))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build(), "Keycloak rola nije dostupna");

        if (roleResponse.statusCode() >= 400) {
            throw keycloakError("Keycloak rola '" + roleName + "' nije dostupna", roleResponse);
        }

        List<JsonNode> roles = new ArrayList<>();
        try {
            roles.add(mapper.readTree(roleResponse.body()));
        } catch (IOException e) {
            throw new WebApplicationException("Neispravan Keycloak role odgovor", 502);
        }

        HttpResponse<String> assignResponse = send(jsonRequest(adminUserRoleMappingsEndpoint(userId))
                .header("Authorization", "Bearer " + token)
                .POST(jsonBody(roles))
                .build(), "Dodjela Keycloak role nije uspjela");

        if (assignResponse.statusCode() >= 400) {
            throw keycloakError("Dodjela Keycloak role nije uspjela", assignResponse);
        }
    }

    private JsonNode postForm(String uri, Map<String, String> form, String message) {
        HttpResponse<String> response = send(HttpRequest.newBuilder(URI.create(uri))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(toForm(form)))
                .build(), message);

        if (response.statusCode() >= 400) {
            throw keycloakError(message, response);
        }

        try {
            return mapper.readTree(response.body());
        } catch (IOException e) {
            throw new WebApplicationException("Neispravan Keycloak odgovor", 502);
        }
    }

    private HttpResponse<String> send(HttpRequest request, String message) {
        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException e) {
            throw new WebApplicationException(message + ": Keycloak nije dostupan", 503);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new WebApplicationException(message + ": zahtjev je prekinut", 503);
        }
    }

    private HttpRequest.Builder jsonRequest(String uri) {
        return HttpRequest.newBuilder(URI.create(uri))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json");
    }

    private HttpRequest.BodyPublisher jsonBody(Object value) {
        try {
            return HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(value));
        } catch (IOException e) {
            throw new WebApplicationException("JSON payload nije validan", 500);
        }
    }

    private WebApplicationException keycloakError(String message, HttpResponse<String> response) {
        return new WebApplicationException(message + " (" + response.statusCode() + "): " + response.body(), response.statusCode());
    }

    private String tokenEndpoint() {
        return stripTrailingSlash(authServerUrl) + "/protocol/openid-connect/token";
    }

    private String adminUsersEndpoint() {
        return stripTrailingSlash(baseUrl) + "/admin/realms/" + encodePath(realm) + "/users";
    }

    private String adminRealmRoleEndpoint(String roleName) {
        return stripTrailingSlash(baseUrl) + "/admin/realms/" + encodePath(realm) + "/roles/" + encodePath(roleName);
    }

    private String adminUserRoleMappingsEndpoint(String userId) {
        return stripTrailingSlash(baseUrl) + "/admin/realms/" + encodePath(realm)
                + "/users/" + encodePath(userId) + "/role-mappings/realm";
    }

    private String toForm(Map<String, String> values) {
        return values.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private String encodePath(String value) {
        return encode(value).replace("+", "%20");
    }

    private String stripTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}

