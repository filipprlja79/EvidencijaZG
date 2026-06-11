package mf.fit.resource;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import mf.fit.dto.CreatePollRequest;
import mf.fit.dto.PollResponse;
import mf.fit.dto.VoteRequest;
import mf.fit.service.GlasanjeService;

import java.util.List;

@Path("/glasanja")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GlasanjeResource {

    @Inject
    GlasanjeService service;

    @GET
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public List<PollResponse> list(@QueryParam("ulazId") Long ulazId, @QueryParam("stanarId") Long stanarId) {
        return service.list(ulazId, stanarId);
    }

    @POST
    @RolesAllowed({"admin", "starjesina"})
    public PollResponse create(CreatePollRequest request) {
        return service.create(request);
    }

    @POST
    @Path("/{id}/glas")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public PollResponse vote(@PathParam("id") Long id, VoteRequest request) {
        return service.vote(id, request);
    }
}
