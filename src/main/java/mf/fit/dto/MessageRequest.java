/*
 * Komentar projekta: DTO objekat koji prenosi podatke izmedju frontend-a i backend-a bez direktnog izlaganja kompletnih entiteta.
 */

package mf.fit.dto;

import java.util.List;

public record MessageRequest(
        String naslov,
        String tekst,
        String tip,
        Long ulazId,
        List<Long> stanarIds,
        Long senderId
) {
}

