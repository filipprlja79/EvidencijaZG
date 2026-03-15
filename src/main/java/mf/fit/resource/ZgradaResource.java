package mf.fit.resource;

import mf.fit.entity.Zgrada;
import mf.fit.service.ZgradaService;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/zgrade")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ZgradaResource {

    @Inject
    ZgradaService service;

    @GET
    public List<Zgrada> list() {
        return service.list();
    }

    @POST
    @Transactional
    public void create(Zgrada zgrada) {
        service.create(zgrada);
    }
}