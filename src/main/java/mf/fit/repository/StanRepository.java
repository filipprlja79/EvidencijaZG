package mf.fit.repository;

import mf.fit.entity.Stan;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class StanRepository {

    @Inject
    EntityManager em;

    @Transactional
    public void save(Stan stan) {
        em.persist(stan);
    }

    public List<Stan> findAll() {
        return em.createQuery("from Stan", Stan.class).getResultList();
    }

    public Stan findById(Long id) {
        return em.find(Stan.class, id);
    }

    public List<Stan> findByUlazId(Long ulazId) {
        return em.createQuery("SELECT s FROM Stan s WHERE s.ulaz.id = :ulazId ORDER BY s.brojStana", Stan.class)
                .setParameter("ulazId", ulazId)
                .getResultList();
    }

    public Stan findByUlazAndBroj(Long ulazId, Integer brojStana) {
        if (ulazId == null || brojStana == null) {
            return null;
        }

        List<Stan> result = em.createQuery("""
                        SELECT s FROM Stan s
                        WHERE s.ulaz.id = :ulazId
                          AND s.brojStana = :brojStana
                        ORDER BY s.id
                        """, Stan.class)
                .setParameter("ulazId", ulazId)
                .setParameter("brojStana", brojStana)
                .setMaxResults(1)
                .getResultList();
        return result.isEmpty() ? null : result.get(0);
    }

    @Transactional
    public Stan update(Long id, Stan updatedStan) {
        Stan existing = em.find(Stan.class, id);

        if (existing == null) {
            return null; // ili throw new RuntimeException("Stan ne postoji");
        }

        // update polja
        existing.setBrojStana(updatedStan.getBrojStana());
        existing.setImeVlasnikaStana(updatedStan.getImeVlasnikaStana());
        existing.setUlaz(updatedStan.getUlaz());
        existing.setDetalji(updatedStan.getDetalji());

        return em.merge(existing);
    }

    @Transactional
    public void delete(Long id) {
        Stan s = em.find(Stan.class, id);
        if (s != null) {
            em.remove(s);
        }
    }
}
