package mf.fit.resource;

import mf.fit.entity.Zgrada;
import mf.fit.service.ZgradaService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/zgrade")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ZgradaResource {

    @Inject
    ZgradaService service;

    // GET ALL
    @GET
    public List<Zgrada> list() {
        return service.list();
    }

    // GET BY ID
    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        try {
            Zgrada zgrada = service.getById(id);
            return Response.ok(zgrada).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        }
    }

    // CREATE
    @POST
    public Response create(Zgrada zgrada) {
        Zgrada created = service.create(zgrada);
        return Response.status(Response.Status.CREATED)
                .entity(created)
                .build();
    }

    // UPDATE
    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, Zgrada zgrada) {
        try {
            Zgrada updated = service.update(id, zgrada);
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