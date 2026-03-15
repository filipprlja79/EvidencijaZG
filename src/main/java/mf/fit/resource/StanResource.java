package mf.fit.resource;

import mf.fit.entity.Stan;
import mf.fit.service.StanService;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/stanovi")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class StanResource {

    @Inject
    StanService service;

    @GET
    public List<Stan> list() {
        return service.list();
    }

    @POST
    @Transactional
    public void create(Stan stan) {
        service.create(stan);
    }
}