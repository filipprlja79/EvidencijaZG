/*
 * Komentar projekta: DTO objekat koji prenosi podatke izmedju frontend-a i backend-a bez direktnog izlaganja kompletnih entiteta.
 */

package mf.fit.dto;

public record DemoAccountResponse(
        String email,
        String password,
        String role,
        String label
) {
}

