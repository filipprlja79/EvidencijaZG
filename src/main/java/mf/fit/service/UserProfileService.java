package mf.fit.service;

import jakarta.enterprise.context.ApplicationScoped;
import mf.fit.dto.UserProfileResponse;
import mf.fit.entity.Stan;
import mf.fit.entity.Stanar;
import mf.fit.entity.Ulaz;
import mf.fit.entity.Zgrada;

@ApplicationScoped
public class UserProfileService {

    public UserProfileResponse toResponse(Stanar stanar) {
        if (stanar == null) {
            return null;
        }

        Stan stan = stanar.getStan();
        Ulaz ulaz = stan != null ? stan.getUlaz() : null;
        Zgrada zgrada = ulaz != null ? ulaz.getZgrada() : null;
        Integer roleCode = stanar.getTipNaloga() == null ? 1 : stanar.getTipNaloga();
        String role = switch (roleCode) {
            case 99 -> "admin";
            case 2 -> "starjesina";
            default -> "stanar";
        };

        return new UserProfileResponse(
                stanar.getId(),
                stanar.getKeycloakId(),
                stanar.getEmail(),
                stanar.getIme(),
                stanar.getPrezime(),
                stanar.getBrTelefona(),
                roleCode,
                role,
                zgrada != null ? zgrada.getId() : null,
                zgrada != null ? zgrada.getNaziv() : null,
                zgrada != null ? zgrada.getGrad() : null,
                zgrada != null ? zgrada.getNaselje() : null,
                ulaz != null ? ulaz.getId() : null,
                ulaz != null ? ulaz.getNazivUlaza() : null,
                ulaz != null ? ulaz.getBrojUlaza() : null,
                stan != null ? stan.getId() : null,
                stan != null ? stan.getBrojStana() : null
        );
    }

    public UserProfileResponse adminProfile(String email) {
        return new UserProfileResponse(
                null,
                null,
                email,
                "Admin",
                "",
                "",
                99,
                "admin",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }
}
