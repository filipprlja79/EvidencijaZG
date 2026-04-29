package mf.fit.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import mf.fit.service.TimezoneService;

@Path("/getTimezoneByIP")
@Produces(MediaType.APPLICATION_JSON)
public class TimezoneResource {

    @Inject
    TimezoneService service;

    @GET
    public Response getTimezoneByIP(@QueryParam("userId") Long userId) {
        if (userId == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Query parametar userId je obavezan")
                    .build();
        }

        try {
            return Response.ok(service.getTimezoneByIP(userId)).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        }
    }
}
