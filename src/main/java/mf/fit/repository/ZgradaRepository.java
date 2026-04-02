package mf.fit.repository;

import mf.fit.entity.Zgrada;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class ZgradaRepository {

    @Inject
    EntityManager em;

    @Transactional
    public void save(Zgrada zgrada) {
        em.persist(zgrada);
    }

    public List<Zgrada> findAll() {
        return em.createQuery("from Zgrada", Zgrada.class).getResultList();
    }

    public Zgrada findById(Long id) {
        return em.find(Zgrada.class, id);
    }

    @Transactional
    public Zgrada update(Long id, Zgrada updatedZgrada) {
        Zgrada existing = em.find(Zgrada.class, id);

        if (existing == null) {
            return null; // ili throw new RuntimeException("Zgrada ne postoji");
        }

        // update polja
        existing.setNaziv(updatedZgrada.getNaziv());
        existing.setVlasnik(updatedZgrada.getVlasnik());
        existing.setGrad(updatedZgrada.getGrad());

        return em.merge(existing);
    }

    @Transactional
    public void delete(Long id) {
        Zgrada zgrada = em.find(Zgrada.class, id);
        if (zgrada != null) {
            em.remove(zgrada);
        }
    }
}