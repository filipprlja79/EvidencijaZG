package mf.fit.repository;

import mf.fit.entity.Zgrada;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import mf.fit.repository.ZgradaRepository;
import java.util.List;

@ApplicationScoped
public class ZgradaRepository {

    @Inject
    EntityManager em;

    public void save(Zgrada zgrada) {
        em.persist(zgrada);
    }

    public List<Zgrada> list() {
        return em.createQuery("from Zgrada", Zgrada.class).getResultList();
    }
}