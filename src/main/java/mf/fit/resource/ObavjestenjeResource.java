package mf.fit.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import mf.fit.entity.Obavjestenje;
import mf.fit.service.ObavjestenjeService;
import jakarta.annotation.security.RolesAllowed;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/obavjestenja")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ObavjestenjeResource {

    @Inject
    ObavjestenjeService service;

    @GET
    public Response getAll() {
        try {
            List<Obavjestenje> lista = service.getAll();
            return Response.ok(lista).build();
        } catch (Exception e) {
            return Response.status(500).entity(error(e)).build();
        }
    }


    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        try {
            Obavjestenje o = service.getById(id);

            if (o == null) {
                return Response.status(404).entity(msg("Not found")).build();
            }

            return Response.ok(o).build();

        } catch (Exception e) {
            return Response.status(500).entity(error(e)).build();
        }
    }

    @POST
    @RolesAllowed("admin")
    public Response create(Obavjestenje o) {
        try {
            service.create(o);
            return Response.status(201).entity(msg("Kreirano")).build();
        } catch (Exception e) {
            return Response.status(500).entity(error(e)).build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, Obavjestenje o) {
        try {
            service.update(id, o);
            return Response.ok(msg("Updated")).build();
        } catch (Exception e) {
            return Response.status(500).entity(error(e)).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        try {
            service.delete(id);
            return Response.ok(msg("Deleted")).build();
        } catch (Exception e) {
            return Response.status(500).entity(error(e)).build();
        }
    }

    // helper metode
    private Map<String, String> msg(String tekst) {
        Map<String, String> m = new HashMap<>();
        m.put("message", tekst);
        return m;
    }

    private Map<String, String> error(Exception e) {
        Map<String, String> m = new HashMap<>();
        m.put("error", e.getMessage());
        return m;
    }
}