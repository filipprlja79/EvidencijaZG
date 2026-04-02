package mf.fit.resource;

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
    public List<DetaljiStana> getAll() {
        return service.list();
    }

    @GET
    @Path("/{id}")
    public DetaljiStana getById(@PathParam("id") Long id) {
        return service.getById(id);
    }

    @POST
    public Response create(DetaljiStana entity) {
        service.create(entity);
        return Response.status(Response.Status.CREATED).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, DetaljiStana d) {
        service.update(id, d);
        return Response.ok().build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        service.delete(id);
        return Response.ok().build();
    }
}