package mf.fit.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import mf.fit.dto.CreatePollRequest;
import mf.fit.dto.PollOptionResponse;
import mf.fit.dto.PollResponse;
import mf.fit.dto.VoteRequest;
import mf.fit.entity.*;
import mf.fit.repository.GlasanjeRepository;
import mf.fit.repository.StanarRepository;
import mf.fit.repository.UlazRepository;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class GlasanjeService {

    @Inject
    GlasanjeRepository repository;

    @Inject
    UlazRepository ulazRepository;

    @Inject
    StanarRepository stanarRepository;

    @Transactional
    public PollResponse create(CreatePollRequest request) {
        if (request == null || isBlank(request.naslov()) || isBlank(request.pitanje())) {
            throw new WebApplicationException("Naslov i pitanje su obavezni", 400);
        }
        if (request.opcije() == null || request.opcije().stream().filter(o -> !isBlank(o)).count() < 2) {
            throw new WebApplicationException("Glasanje mora imati najmanje dvije opcije", 400);
        }

        Glasanje glasanje = new Glasanje();
        glasanje.setNaslov(request.naslov().trim());
        glasanje.setPitanje(request.pitanje().trim());
        glasanje.setKreiranoAt(LocalDateTime.now());
        if (request.ulazId() != null) {
            Ulaz ulaz = ulazRepository.findById(request.ulazId());
            if (ulaz == null) {
                throw new WebApplicationException("Ulaz nije pronadjen", 404);
            }
            glasanje.setUlaz(ulaz);
        }

        List<GlasanjeOpcija> opcije = request.opcije().stream()
                .filter(o -> !isBlank(o))
                .map(text -> {
                    GlasanjeOpcija opcija = new GlasanjeOpcija();
                    opcija.setTekst(text.trim());
                    opcija.setGlasanje(glasanje);
                    return opcija;
                })
                .toList();
        glasanje.setOpcije(opcije);
        repository.save(glasanje);
        return toResponse(glasanje, null);
    }

    @Transactional
    public List<PollResponse> list(Long ulazId, Long stanarId) {
        return repository.listVisible(ulazId).stream()
                .map(glasanje -> toResponse(glasanje, stanarId))
                .toList();
    }

    @Transactional
    public PollResponse vote(Long id, VoteRequest request) {
        if (request == null || request.stanarId() == null || request.opcijaId() == null) {
            throw new WebApplicationException("Stanar i opcija su obavezni", 400);
        }
        Glasanje glasanje = repository.findById(id);
        GlasanjeOpcija opcija = repository.findOptionById(request.opcijaId());
        Stanar stanar = stanarRepository.findById(request.stanarId());
        if (glasanje == null || opcija == null || stanar == null || !opcija.getGlasanje().getId().equals(glasanje.getId())) {
            throw new WebApplicationException("Glasanje, opcija ili stanar nijesu validni", 400);
        }

        Glas glas = repository.findVote(id, request.stanarId());
        if (glas == null) {
            glas = new Glas();
            glas.setGlasanje(glasanje);
            glas.setStanar(stanar);
        }
        glas.setOpcija(opcija);
        glas.setGlasanoAt(LocalDateTime.now());
        repository.saveVote(glas);
        return toResponse(glasanje, request.stanarId());
    }

    private PollResponse toResponse(Glasanje glasanje, Long stanarId) {
        if (glasanje.getOpcije() != null) {
            glasanje.getOpcije().size();
        }
        Long mojGlas = null;
        if (stanarId != null) {
            Glas vote = repository.findVote(glasanje.getId(), stanarId);
            mojGlas = vote == null || vote.getOpcija() == null ? null : vote.getOpcija().getId();
        }
        Ulaz ulaz = glasanje.getUlaz();
        List<PollOptionResponse> options = glasanje.getOpcije().stream()
                .map(opcija -> new PollOptionResponse(opcija.getId(), opcija.getTekst(), repository.countVotes(opcija.getId())))
                .toList();
        return new PollResponse(
                glasanje.getId(),
                glasanje.getNaslov(),
                glasanje.getPitanje(),
                ulaz == null ? null : ulaz.getId(),
                ulaz == null ? "Svi ulazi" : firstPresent(ulaz.getNazivUlaza(), ulaz.getBrojUlaza(), "Ulaz " + ulaz.getId()),
                glasanje.isAktivno(),
                glasanje.getKreiranoAt(),
                mojGlas,
                options
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String firstPresent(String... values) {
        for (String value : values) {
            if (!isBlank(value)) return value;
        }
        return "";
    }
}
