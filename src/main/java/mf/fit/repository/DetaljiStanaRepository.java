package mf.fit.repository;

import mf.fit.entity.DetaljiStana;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class DetaljiStanaRepository {

    @Inject
    EntityManager em;

    @Transactional
    public void save(DetaljiStana d) {
        em.persist(d);
    }

    public List<DetaljiStana> findAll() {
        return em.createQuery("from DetaljiStana", DetaljiStana.class).getResultList();
    }

    public DetaljiStana findById(Long id) {
        return em.find(DetaljiStana.class, id);
    }

    @Transactional
    public void delete(Long id) {
        DetaljiStana d = em.find(DetaljiStana.class, id);
        if (d != null) {
            em.remove(d);
        }
    }
}