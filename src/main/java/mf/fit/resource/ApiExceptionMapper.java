/*
 * Komentar projekta: Pretvara REST izuzetke u konzistentan JSON odgovor za frontend.
 */

package mf.fit.resource;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import mf.fit.dto.ErrorResponse;

@Provider
public class ApiExceptionMapper implements ExceptionMapper<WebApplicationException> {

    @Override
    public Response toResponse(WebApplicationException exception) {
        Response original = exception.getResponse();
        int status = original == null ? 500 : original.getStatus();
        Object entity = original == null ? null : original.getEntity();

        if (entity != null) {
            return Response.status(status)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(entity)
                    .build();
        }

        String message = exception.getMessage();
        if (message == null || message.isBlank()) {
            message = defaultMessage(status);
        }

        return Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ErrorResponse(message))
                .build();
    }

    private String defaultMessage(int status) {
        return switch (status) {
            case 400 -> "Zahtjev nije validan.";
            case 401 -> "Email ili sifra nijesu ispravni.";
            case 403 -> "Nemate dozvolu za ovu akciju.";
            case 404 -> "Podaci nijesu pronadjeni.";
            case 409 -> "Nalog sa ovim emailom vec postoji. Prijavite se ili koristite drugi email.";
            default -> "Doslo je do greske. Pokusajte ponovo.";
        };
    }
}
