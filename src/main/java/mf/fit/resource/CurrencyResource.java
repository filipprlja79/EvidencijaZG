package mf.fit.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import mf.fit.service.CurrencyService;

@Path("/")
@Produces(MediaType.APPLICATION_JSON)
public class CurrencyResource {

    @Inject
    CurrencyService service;

    @GET
    @Path("/currency")
    public Response convert(@QueryParam("from") String from,
                            @QueryParam("to") String to,
                            @QueryParam("value") Double value) {
        Response validationError = validateParams(from, to, value);
        if (validationError != null) {
            return validationError;
        }

        return Response.ok(service.convert(from, to, value)).build();
    }

    @GET
    @Path("/currencyConversion")
    public Response convertAndSave(@QueryParam("from") String from,
                                   @QueryParam("to") String to,
                                   @QueryParam("value") Double value,
                                   @QueryParam("userId") Long userId) {
        Response validationError = validateParams(from, to, value);
        if (validationError != null) {
            return validationError;
        }

        if (userId == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Query parametar userId je obavezan")
                    .build();
        }

        try {
            return Response.ok(service.convertAndSave(from, to, value, userId)).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        }
    }

    private Response validateParams(String from, String to, Double value) {
        if (from == null || from.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Query parametar from je obavezan")
                    .build();
        }

        if (to == null || to.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Query parametar to je obavezan")
                    .build();
        }

        if (value == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Query parametar 'value' je obavezan")
                    .build();
        }

        return null;
    }
}
