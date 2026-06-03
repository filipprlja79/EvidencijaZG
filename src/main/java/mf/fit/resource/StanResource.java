/*
 * Komentar projekta: REST resource sloj koji definise HTTP endpoint-e dostupne frontend aplikaciji.
 */

package mf.fit.resource;

import jakarta.annotation.security.RolesAllowed;
import mf.fit.entity.Stan;
import mf.fit.service.StanService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/stanovi")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class StanResource {

    @Inject
    StanService service;

    // GET ALL
    @GET
    @RolesAllowed({"admin", "starjesina"})
    public List<Stan> list() {
        return service.list();
    }

    @GET
    @Path("/ulaz/{ulazId}")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public List<Stan> listByUlaz(@PathParam("ulazId") Long ulazId) {
        return service.listByUlaz(ulazId);
    }

    // GET BY ID
    @GET
    @Path("/{id}")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public Response getById(@PathParam("id") Long id) {
        try {
            Stan stan = service.getById(id);
            return Response.ok(stan).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        }
    }

    // CREATE
    @POST
    @RolesAllowed("admin")
    public Response create(Stan stan) {
        Stan created = service.create(stan);
        return Response.status(Response.Status.CREATED)
                .entity(created)
                .build();
    }

    // UPDATE
    @PUT
    @Path("/{id}")
    @RolesAllowed("admin")
    public Response update(@PathParam("id") Long id, Stan stan) {
        try {
            Stan updated = service.update(id, stan);
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

