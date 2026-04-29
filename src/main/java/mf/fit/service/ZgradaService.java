package mf.fit.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import mf.fit.entity.Ulaz;
import mf.fit.entity.Zgrada;
import mf.fit.repository.ZgradaRepository;

import java.util.List;

@ApplicationScoped
public class ZgradaService {

    @Inject
    ZgradaRepository repository;

    @Transactional
    public Zgrada create(Zgrada zgrada) {
        repository.save(zgrada);
        return zgrada;
    }

    public List<Zgrada> list() {
        return repository.findAll();
    }

    public Zgrada getById(Long id) {
        Zgrada zgrada = repository.findById(id);
        if (zgrada == null) {
            throw new WebApplicationException("Zgrada sa ID " + id + " ne postoji", 404);
        }
        return zgrada;
    }

    public List<Zgrada> findByGrad(String grad) {
        return repository.findByGrad(grad);
    }

    public List<Zgrada> findByNaziv(String naziv) {
        return repository.findByNaziv(naziv);
    }

    public List<Ulaz> getUlaziZaZgradu(Long id) {
        Zgrada zgrada = repository.findById(id);

        if (zgrada == null) {
            throw new WebApplicationException("Zgrada sa ID " + id + " ne postoji", 404);
        }

        return zgrada.getUlazi();
    }

    @Transactional
    public Zgrada update(Long id, Zgrada nova) {
        Zgrada updated = repository.update(id, nova);
        if (updated == null) {
            throw new WebApplicationException("Zgrada sa ID " + id + " ne postoji", 404);
        }
        return updated;
    }

    @Transactional
    public void delete(Long id) {
        Zgrada zgrada = repository.findById(id);
        if (zgrada == null) {
            throw new WebApplicationException("Zgrada sa ID " + id + " ne postoji", 404);
        }
        repository.delete(id);
    }
}