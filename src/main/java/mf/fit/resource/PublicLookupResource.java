package mf.fit.resource;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import mf.fit.dto.LookupOption;
import mf.fit.entity.Stan;
import mf.fit.entity.Ulaz;
import mf.fit.entity.Zgrada;
import mf.fit.repository.StanRepository;
import mf.fit.repository.UlazRepository;
import mf.fit.repository.ZgradaRepository;

import java.util.List;

@Path("/public")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class PublicLookupResource {

    @Inject
    ZgradaRepository zgradaRepository;

    @Inject
    UlazRepository ulazRepository;

    @Inject
    StanRepository stanRepository;

    @GET
    @Path("/gradovi")
    public List<String> gradovi() {
        return zgradaRepository.findGradovi();
    }

    @GET
    @Path("/naselja")
    public List<String> naselja(@QueryParam("grad") String grad) {
        return zgradaRepository.findNaselja(grad);
    }

    @GET
    @Path("/zgrade")
    public List<LookupOption> zgrade(@QueryParam("grad") String grad, @QueryParam("naselje") String naselje) {
        return zgradaRepository.findAll().stream()
                .filter(z -> grad == null || grad.isBlank() || grad.equals(z.getGrad()))
                .filter(z -> naselje == null || naselje.isBlank() || naselje.equals(z.getNaselje()))
                .map(this::toLookup)
                .toList();
    }

    @GET
    @Path("/ulazi")
    public List<LookupOption> ulazi(@QueryParam("zgradaId") Long zgradaId) {
        if (zgradaId == null) {
            return List.of();
        }
        return ulazRepository.findByZgradaId(zgradaId).stream()
                .map(this::toLookup)
                .toList();
    }

    @GET
    @Path("/stanovi")
    public List<LookupOption> stanovi(@QueryParam("ulazId") Long ulazId) {
        if (ulazId == null) {
            return List.of();
        }
        return stanRepository.findByUlazId(ulazId).stream()
                .map(this::toLookup)
                .toList();
    }

    private LookupOption toLookup(Zgrada zgrada) {
        String description = String.join(" / ",
                zgrada.getGrad() == null ? "" : zgrada.getGrad(),
                zgrada.getNaselje() == null ? "" : zgrada.getNaselje()
        ).replaceAll("(^ / | / $)", "");
        String label = zgrada.getNaziv() == null || zgrada.getNaziv().isBlank()
                ? "Zgrada " + zgrada.getId()
                : zgrada.getNaziv();
        return new LookupOption(zgrada.getId(), label, description);
    }

    private LookupOption toLookup(Ulaz ulaz) {
        String label = ulaz.getNazivUlaza() == null || ulaz.getNazivUlaza().isBlank()
                ? "Ulaz " + ulaz.getBrojUlaza()
                : ulaz.getNazivUlaza();
        return new LookupOption(ulaz.getId(), label, ulaz.getBrojZiroRacuna());
    }

    private LookupOption toLookup(Stan stan) {
        return new LookupOption(stan.getId(), "Stan " + stan.getBrojStana(), stan.getImeVlasnikaStana());
    }
}
