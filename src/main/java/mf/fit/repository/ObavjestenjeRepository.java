package mf.fit.repository;

import mf.fit.entity.Obavjestenje;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import java.util.List;

@ApplicationScoped
public class ObavjestenjeRepository {

    @Inject
    EntityManager em;

    public void save(Obavjestenje o) {
        em.persist(o);
    }

    public List<Obavjestenje> list() {
        return em.createQuery("from Obavjestenje", Obavjestenje.class).getResultList();
    }

    public Obavjestenje findById(Long id) {
        return em.find(Obavjestenje.class, id);
    }

    public void delete(Long id) {
        Obavjestenje o = em.find(Obavjestenje.class, id);
        if (o != null) {
            em.remove(o);
        }
    }
}