package mf.fit.service;

import mf.fit.entity.Stan;
import mf.fit.repository.StanRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class StanService {

    @Inject
    StanRepository repository;

    @Transactional
    public Stan create(Stan stan) {
        repository.save(stan);
        return stan;
    }

    public List<Stan> list() {
        return repository.findAll();
    }

    public Stan getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Stan update(Long id, Stan stan) {
        Stan updated = repository.update(id, stan);

        if (updated == null) {
            throw new RuntimeException("Stan sa ID " + id + " ne postoji");
        }

        return updated;
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(id);
    }
}