package mf.fit.resource;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import mf.fit.dto.MessageRequest;
import mf.fit.entity.Obavjestenje;
import mf.fit.service.ObavjestenjeService;

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
    @RolesAllowed({"admin", "starjesina"})
    public List<Obavjestenje> getAll() {
        return service.getAll();
    }

    @GET
    @Path("/moje/{stanarId}")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public List<Obavjestenje> getVisibleForStanar(@PathParam("stanarId") Long stanarId) {
        return service.getVisibleForStanar(stanarId);
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public Response getById(@PathParam("id") Long id) {
        Obavjestenje o = service.getById(id);
        if (o == null) {
            return Response.status(404).entity(msg("Not found")).build();
        }
        return Response.ok(o).build();
    }

    @POST
    @Path("/posalji")
    @RolesAllowed({"admin", "starjesina"})
    public Obavjestenje send(MessageRequest request) {
        return service.send(request);
    }

    @POST
    @RolesAllowed("admin")
    public Response create(Obavjestenje o) {
        service.create(o);
        return Response.status(201).entity(msg("Kreirano")).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("admin")
    public Response update(@PathParam("id") Long id, Obavjestenje o) {
        service.update(id, o);
        return Response.ok(msg("Updated")).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("admin")
    public Response delete(@PathParam("id") Long id) {
        service.delete(id);
        return Response.ok(msg("Deleted")).build();
    }

    private Map<String, String> msg(String tekst) {
        Map<String, String> m = new HashMap<>();
        m.put("message", tekst);
        return m;
    }
}
