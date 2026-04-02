package mf.fit.service;

import mf.fit.entity.DetaljiStana;
import mf.fit.repository.DetaljiStanaRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class DetaljiStanaService {

    @Inject
    DetaljiStanaRepository repository;

    @Transactional
    public void create(DetaljiStana d) {
        repository.save(d);
    }

    public List<DetaljiStana> list() {
        return repository.findAll();
    }

    public DetaljiStana getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public void update(Long id, DetaljiStana novi) {
        DetaljiStana d = repository.findById(id);
        if (d != null) {
            d.setBrojSoba(novi.getBrojSoba());
            d.setKvadratura(novi.getKvadratura());
        }
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(id);
    }
}