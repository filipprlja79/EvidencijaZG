/*
 * Komentar projekta: REST resource sloj koji definise HTTP endpoint-e dostupne frontend aplikaciji.
 */

package mf.fit.resource;

import jakarta.annotation.security.RolesAllowed;
import mf.fit.entity.Ulaz;
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
@RolesAllowed("admin")
public class ZgradaResource {

    @Inject
    ZgradaService service;

    @GET
    public List<Zgrada> list() {
        return service.list();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        try {
            Zgrada zgrada = service.getById(id);
            return Response.ok(zgrada).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }

    @GET
    @Path("/pretraga")
    public Response pretraziPoGradu(@QueryParam("grad") String grad, @QueryParam("naselje") String naselje) {
        if (grad == null || grad.isBlank()) {
            return Response.status(400).entity("Parametar 'grad' je obavezan").build();
        }
        List<Zgrada> result = service.findByGrad(grad).stream()
                .filter(z -> naselje == null || naselje.isBlank() || naselje.equals(z.getNaselje()))
                .toList();
        return Response.ok(result).build();
    }

    @GET
    @Path("/naziv/{naziv}")
    public Response pretraziPoNazivu(@PathParam("naziv") String naziv) {
        return Response.ok(service.findByNaziv(naziv)).build();
    }

    @GET
    @Path("/{id}/ulazi")
    public Response getUlazi(@PathParam("id") Long id) {
        return Response.ok(service.getUlaziZaZgradu(id)).build();
    }

    @POST
    public Response create(Zgrada zgrada) {
        Zgrada created = service.create(zgrada);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, Zgrada zgrada) {
        try {
            Zgrada updated = service.update(id, zgrada);
            return Response.ok(updated).build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        try {
            service.delete(id);
            return Response.noContent().build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }
}

