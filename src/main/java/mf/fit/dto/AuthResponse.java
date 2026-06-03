/*
 * Komentar projekta: DTO objekat koji prenosi podatke izmedju frontend-a i backend-a bez direktnog izlaganja kompletnih entiteta.
 */

package mf.fit.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserProfileResponse profile
) {
}

