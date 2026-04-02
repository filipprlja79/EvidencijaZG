package mf.fit.resource;

import mf.fit.entity.Stanar;
import mf.fit.service.StanarService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/stanari")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class StanarResource {

    @Inject
    StanarService service;

    // GET ALL
    @GET
    public List<Stanar> getAll() {
        return service.list();
    }

    // GET BY ID
    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        try {
            Stanar stanar = service.getById(id);
            return Response.ok(stanar).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        }
    }

    // CREATE
    @POST
    public Response create(Stanar stanar) {
        Stanar created = service.create(stanar);
        return Response.status(Response.Status.CREATED)
                .entity(created)
                .build();
    }

    // UPDATE
    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, Stanar stanar) {
        try {
            Stanar updated = service.update(id, stanar);
            return Response.ok(updated).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        }
    }

    // DELETE
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        try {
            service.delete(id);
            return Response.noContent().build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        }
    }
}