package mf.fit.repository;

import mf.fit.entity.Stan;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import java.util.List;

@ApplicationScoped
public class StanRepository {

    @Inject
    EntityManager em;

    public void save(Stan stan) {
        em.persist(stan);
    }

    public List<Stan> list() {
        return em.createQuery("from Stan", Stan.class).getResultList();
    }
}