package mf.fit.service;

import mf.fit.entity.Zgrada;
import mf.fit.repository.ZgradaRepository;

import jakarta.inject.Inject;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class ZgradaService {

    @Inject
    ZgradaRepository repository;

    public List<Zgrada> list() {
        return repository.list();
    }

    public void create(Zgrada zgrada) {
        repository.save(zgrada);
    }
}