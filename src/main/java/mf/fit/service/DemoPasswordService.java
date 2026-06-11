/*
 * Komentar projekta: Service sloj koji sadrzi poslovnu logiku i koordinise repository-je, validacije i spoljasnje servise.
 */

package mf.fit.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.mindrot.jbcrypt.BCrypt;

@ApplicationScoped
public class DemoPasswordService {

    private static final String BCRYPT_PREFIX = "$2";

    public String hash(String email, String password) {
        return BCrypt.hashpw(password == null ? "" : password, BCrypt.gensalt(12));
    }

    public boolean matches(String email, String password, String storedValue) {
        if (storedValue == null || storedValue.isBlank()) {
            return false;
        }
        if (storedValue.startsWith(BCRYPT_PREFIX)) {
            return BCrypt.checkpw(password == null ? "" : password, storedValue);
        }
        return false;
    }
}

