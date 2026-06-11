package mf.fit.dto;

import java.util.List;

public record CreatePollRequest(
        String naslov,
        String pitanje,
        Long ulazId,
        List<String> opcije
) {
}
