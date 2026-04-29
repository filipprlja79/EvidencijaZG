package mf.fit.resource;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/admin")
@Produces(MediaType.APPLICATION_JSON)
public class AdminResource {

    @GET
    @Path("/test")
    @RolesAllowed("admin")
    public Response testAdminRole() {
        return Response.ok("Uspjesno ste pristupili zasticenom admin resursu").build();
    }
}
