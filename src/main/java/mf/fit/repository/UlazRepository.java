package mf.fit.repository;

import mf.fit.entity.Ulaz;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class UlazRepository {

    @Inject
    EntityManager em;

    @Transactional
    public void save(Ulaz ulaz) {
        em.persist(ulaz);
    }

    public List<Ulaz> findAll() {
        return em.createQuery("from Ulaz", Ulaz.class).getResultList();
    }

    public Ulaz findById(Long id) {
        return em.find(Ulaz.class, id);
    }

    @Transactional
    public Ulaz update(Long id, Ulaz updatedUlaz) {
        Ulaz existing = em.find(Ulaz.class, id);

        if (existing == null) {
            return null; // ili throw new RuntimeException("Ulaz ne postoji");
        }

        // update polja
        existing.setBrojUlaza(updatedUlaz.getBrojUlaza());
        existing.setBrojZiroRacuna(updatedUlaz.getBrojZiroRacuna());
        existing.setNazivUlaza(updatedUlaz.getNazivUlaza());
        existing.setZgrada(updatedUlaz.getZgrada());

        return em.merge(existing);
    }

    @Transactional
    public void delete(Long id) {
        Ulaz ulaz = em.find(Ulaz.class, id);
        if (ulaz != null) {
            em.remove(ulaz);
        }
    }
}