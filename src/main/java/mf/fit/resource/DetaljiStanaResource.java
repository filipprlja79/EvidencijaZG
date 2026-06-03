package mf.fit.resource;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import mf.fit.entity.DetaljiStana;
import mf.fit.service.DetaljiStanaService;
import java.util.List;

@Path("/detalji-stana")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DetaljiStanaResource {

    @Inject
    DetaljiStanaService service;

    @GET
    @RolesAllowed({"admin", "starjesina"})
    public List<DetaljiStana> getAll() {
        return service.list();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public DetaljiStana getById(@PathParam("id") Long id) {
        return service.getById(id);
    }

    @POST
    @RolesAllowed("admin")
    public Response create(DetaljiStana entity) {
        service.create(entity);
        return Response.status(Response.Status.CREATED).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("admin")
    public Response update(@PathParam("id") Long id, DetaljiStana d) {
        service.update(id, d);
        return Response.ok().build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("admin")
    public Response delete(@PathParam("id") Long id) {
        service.delete(id);
        return Response.ok().build();
    }
}
