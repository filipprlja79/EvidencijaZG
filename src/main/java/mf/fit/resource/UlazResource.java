/*
 * Komentar projekta: REST resource sloj koji definise HTTP endpoint-e dostupne frontend aplikaciji.
 */

package mf.fit.resource;

import jakarta.annotation.security.RolesAllowed;
import mf.fit.entity.Ulaz;
import mf.fit.service.UlazService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/ulazi")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UlazResource {

    @Inject
    UlazService service;

    // GET ALL
    @GET
    @RolesAllowed({"admin", "starjesina"})
    public List<Ulaz> list() {
        return service.list();
    }

    // GET BY ID
    @GET
    @Path("/{id}")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public Response getById(@PathParam("id") Long id) {
        try {
            Ulaz ulaz = service.getById(id);
            return Response.ok(ulaz).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        }
    }

    // CREATE
    @POST
    @RolesAllowed("admin")
    public Response create(Ulaz ulaz) {
        Ulaz created = service.create(ulaz);
        return Response.status(Response.Status.CREATED)
                .entity(created)
                .build();
    }

    // UPDATE
    @PUT
    @Path("/{id}")
    @RolesAllowed("admin")
    public Response update(@PathParam("id") Long id, Ulaz ulaz) {
        try {
            Ulaz updated = service.update(id, ulaz);
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

