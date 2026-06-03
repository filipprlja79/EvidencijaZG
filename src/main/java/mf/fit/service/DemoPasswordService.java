/*
 * Komentar projekta: Service sloj koji sadrzi poslovnu logiku i koordinise repository-je, validacije i spoljasnje servise.
 */

package mf.fit.service;

import jakarta.enterprise.context.ApplicationScoped;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@ApplicationScoped
public class DemoPasswordService {

    private static final String PREFIX = "demo-sha256:";

    public String hash(String email, String password) {
        return PREFIX + sha256((email == null ? "" : email.toLowerCase()) + ":" + (password == null ? "" : password));
    }

    public boolean matches(String email, String password, String storedValue) {
        if (storedValue == null || storedValue.isBlank()) {
            return false;
        }
        if (!storedValue.startsWith(PREFIX)) {
            return storedValue.equals(password);
        }
        return storedValue.equals(hash(email, password));
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 nije dostupan", e);
        }
    }
}

