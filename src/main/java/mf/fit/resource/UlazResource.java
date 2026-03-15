package mf.fit.resource;

import mf.fit.entity.Ulaz;
import mf.fit.service.UlazService;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/ulazi")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UlazResource {

    @Inject
    UlazService service;

    @GET
    public List<Ulaz> list() {
        return service.list();
    }

    @POST
    @Transactional
    public void create(Ulaz ulaz) {
        service.create(ulaz);
    }
}