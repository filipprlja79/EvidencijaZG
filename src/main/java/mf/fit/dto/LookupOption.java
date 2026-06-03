/*
 * Komentar projekta: DTO objekat koji prenosi podatke izmedju frontend-a i backend-a bez direktnog izlaganja kompletnih entiteta.
 */

package mf.fit.dto;

public record LookupOption(
        Long id,
        String label,
        String description
) {
}

