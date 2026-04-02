package mf.fit.service;

import mf.fit.entity.Ulaz;
import mf.fit.repository.UlazRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class UlazService {

    @Inject
    UlazRepository repository;

    // CREATE
    @Transactional
    public Ulaz create(Ulaz ulaz) {
        repository.save(ulaz);
        return ulaz;
    }

    // READ ALL
    public List<Ulaz> list() {
        return repository.findAll();
    }

    // READ BY ID
    public Ulaz getById(Long id) {
        Ulaz ulaz = repository.findById(id);

        if (ulaz == null) {
            throw new RuntimeException("Ulaz sa ID " + id + " ne postoji");
        }

        return ulaz;
    }

    // UPDATE
    @Transactional
    public Ulaz update(Long id, Ulaz novi) {
        Ulaz updated = repository.update(id, novi);

        if (updated == null) {
            throw new RuntimeException("Ulaz sa ID " + id + " ne postoji");
        }

        return updated;
    }

    // DELETE
    @Transactional
    public void delete(Long id) {
        Ulaz ulaz = repository.findById(id);

        if (ulaz == null) {
            throw new RuntimeException("Ulaz sa ID " + id + " ne postoji");
        }

        repository.delete(id);
    }
}