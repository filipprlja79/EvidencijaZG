package mf.fit.service;

import mf.fit.entity.Ulaz;
import mf.fit.repository.UlazRepository;

import jakarta.inject.Inject;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class UlazService {

    @Inject
    UlazRepository repository;

    public List<Ulaz> list() {
        return repository.list();
    }

    public void create(Ulaz ulaz) {
        repository.save(ulaz);
    }
}