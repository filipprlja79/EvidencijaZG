package mf.fit.service;

import mf.fit.entity.Zgrada;
import mf.fit.repository.ZgradaRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class ZgradaService {

    @Inject
    ZgradaRepository repository;

    // CREATE
    @Transactional
    public Zgrada create(Zgrada zgrada) {
        repository.save(zgrada);
        return zgrada;
    }

    // READ ALL
    public List<Zgrada> list() {
        return repository.findAll();
    }

    // READ BY ID
    public Zgrada getById(Long id) {
        Zgrada zgrada = repository.findById(id);

        if (zgrada == null) {
            throw new RuntimeException("Zgrada sa ID " + id + " ne postoji");
        }

        return zgrada;
    }

    // UPDATE
    @Transactional
    public Zgrada update(Long id, Zgrada nova) {
        Zgrada updated = repository.update(id, nova);

        if (updated == null) {
            throw new RuntimeException("Zgrada sa ID " + id + " ne postoji");
        }

        return updated;
    }

    // DELETE
    @Transactional
    public void delete(Long id) {
        Zgrada zgrada = repository.findById(id);

        if (zgrada == null) {
            throw new RuntimeException("Zgrada sa ID " + id + " ne postoji");
        }

        repository.delete(id);
    }
}