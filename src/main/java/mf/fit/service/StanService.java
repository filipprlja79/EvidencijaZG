package mf.fit.service;

import mf.fit.entity.Stan;
import mf.fit.repository.StanRepository;

import jakarta.inject.Inject;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class StanService {

    @Inject
    StanRepository repository;

    public List<Stan> list() {
        return repository.list();
    }

    public void create(Stan stan) {
        repository.save(stan);
    }
}