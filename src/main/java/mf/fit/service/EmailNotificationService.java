/*
 * Komentar projekta: Service sloj koji sadrzi poslovnu logiku i koordinise repository-je, validacije i spoljasnje servise.
 */

package mf.fit.service;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import mf.fit.entity.Stanar;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.Optional;

@ApplicationScoped
public class EmailNotificationService {

    private static final Logger LOG = Logger.getLogger(EmailNotificationService.class);

    @Inject
    Mailer mailer;

    @ConfigProperty(name = "app.mail.enabled", defaultValue = "false")
    boolean enabled;

    @ConfigProperty(name = "quarkus.mailer.username", defaultValue = "")
    Optional<String> smtpUser;

    public void sendNotification(Stanar recipient, String subject, String body) {
        if (recipient == null || recipient.getEmail() == null || recipient.getEmail().isBlank()) {
            return;
        }

        if (!enabled || smtpUser.isEmpty() || smtpUser.get().isBlank() || "disabled".equals(smtpUser.get())) {
            LOG.infof("Email notification skipped for %s: %s", recipient.getEmail(), subject);
            return;
        }

        mailer.send(Mail.withText(recipient.getEmail(), subject, body));
    }
}

