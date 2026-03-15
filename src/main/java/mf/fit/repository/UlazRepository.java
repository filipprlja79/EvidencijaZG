package mf.fit.repository;

import mf.fit.entity.Ulaz;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import java.util.List;

@ApplicationScoped
public class UlazRepository {

    @Inject
    EntityManager em;

    public void save(Ulaz ulaz) {
        em.persist(ulaz);
    }

    public List<Ulaz> list() {
        return em.createQuery("from Ulaz", Ulaz.class).getResultList();
    }
}