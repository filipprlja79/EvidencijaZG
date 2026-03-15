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

    @Transactional
    public void create(Stanar stanar) {
        repository.save(stanar);
    }

    public List<Stanar> list() {
        return repository.findAll();
    }
}