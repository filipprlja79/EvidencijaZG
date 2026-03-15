package mf.fit.repository;

import mf.fit.entity.Stanar;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.inject.Inject;
import java.util.List;

@ApplicationScoped
public class StanarRepository {

    @Inject
    EntityManager em;

    public void save(Stanar stanar) {
        em.persist(stanar);
    }

    public List<Stanar> findAll() {
        return em.createQuery("from Stanar", Stanar.class).getResultList();
    }
}