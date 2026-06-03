/*
 * Komentar projekta: REST resource sloj koji definise HTTP endpoint-e dostupne frontend aplikaciji.
 */

package mf.fit.resource;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import mf.fit.dto.BlockRequest;
import mf.fit.entity.BlokadaPoruka;
import mf.fit.service.BlokadaPorukaService;

import java.util.List;
import java.util.Map;

@Path("/blokade")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"admin", "starjesina", "stanar"})
public class BlokadaPorukaResource {

    @Inject
    BlokadaPorukaService service;

    @GET
    @Path("/{stanarId}")
    public List<BlokadaPoruka> list(@PathParam("stanarId") Long stanarId) {
        return service.listFor(stanarId);
    }

    @POST
    @Path("/{stanarId}")
    public BlokadaPoruka block(@PathParam("stanarId") Long stanarId, BlockRequest request) {
        return service.block(stanarId, request.blockedStanarId());
    }

    @DELETE
    @Path("/{stanarId}/{blockedStanarId}")
    public Response unblock(@PathParam("stanarId") Long stanarId, @PathParam("blockedStanarId") Long blockedStanarId) {
        service.unblock(stanarId, blockedStanarId);
        return Response.ok(Map.of("message", "Odblokirano")).build();
    }
}

