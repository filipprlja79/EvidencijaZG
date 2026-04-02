package mf.fit.service;

import mf.fit.entity.Stanar;
import mf.fit.repository.StanarRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class StanarService {

    @Inject
    StanarRepository repository;

    // CREATE
    @Transactional
    public Stanar create(Stanar stanar) {
        repository.save(stanar);
        return stanar;
    }

    // READ ALL
    public List<Stanar> list() {
        return repository.findAll();
    }

    // READ BY ID
    public Stanar getById(Long id) {
        Stanar stanar = repository.findById(id);

        if (stanar == null) {
            throw new RuntimeException("Stanar sa ID " + id + " ne postoji");
        }

        return stanar;
    }

    // UPDATE
    @Transactional
    public Stanar update(Long id, Stanar novi) {
        Stanar updated = repository.update(id, novi);

        if (updated == null) {
            throw new RuntimeException("Stanar sa ID " + id + " ne postoji");
        }

        return updated;
    }

    // DELETE
    @Transactional
    public void delete(Long id) {
        Stanar stanar = repository.findById(id);

        if (stanar == null) {
            throw new RuntimeException("Stanar sa ID " + id + " ne postoji");
        }

        repository.delete(id);
    }
}