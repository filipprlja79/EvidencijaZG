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
