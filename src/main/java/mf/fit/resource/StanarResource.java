package mf.fit.resource;

import mf.fit.entity.Stanar;
import mf.fit.service.StanarService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/stanari")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class StanarResource {

    @Inject
    StanarService service;

    @GET
    public List<Stanar> getAll() {
        return service.list();
    }

    @POST
    public void create(Stanar stanar) {
        service.create(stanar);
    }
}