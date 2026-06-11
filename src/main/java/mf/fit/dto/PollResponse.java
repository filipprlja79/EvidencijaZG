package mf.fit.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PollResponse(
        Long id,
        String naslov,
        String pitanje,
        Long ulazId,
        String ulazNaziv,
        boolean aktivno,
        LocalDateTime kreiranoAt,
        Long mojGlasOpcijaId,
        List<PollOptionResponse> opcije
) {
}
