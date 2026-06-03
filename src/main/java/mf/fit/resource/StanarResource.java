package mf.fit.resource;

import jakarta.annotation.security.RolesAllowed;
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
    @RolesAllowed({"admin", "starjesina"})
    public List<Stanar> getAll() {
        return service.list();
    }

    @GET
    @Path("/ulaz/{ulazId}")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public List<Stanar> getByUlaz(@PathParam("ulazId") Long ulazId) {
        return service.listByUlaz(ulazId);
    }

    // GET BY ID
    @GET
    @Path("/{id}")
    @RolesAllowed({"admin", "starjesina", "stanar"})
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
    @RolesAllowed("admin")
    public Response create(Stanar stanar) {
        Stanar created = service.create(stanar);
        return Response.status(Response.Status.CREATED)
                .entity(created)
                .build();
    }

    // UPDATE
    @PUT
    @Path("/{id}")
    @RolesAllowed("admin")
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
    @RolesAllowed("admin")
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
