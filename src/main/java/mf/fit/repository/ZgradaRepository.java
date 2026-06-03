/*
 * Komentar projekta: Repository sloj koji centralizuje rad sa bazom preko EntityManager-a.
 */

package mf.fit.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import mf.fit.entity.Zgrada;

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

    public List<Zgrada> findByGrad(String grad) {
        return em.createQuery("SELECT z FROM Zgrada z WHERE z.grad = :grad", Zgrada.class)
                .setParameter("grad", grad)
                .getResultList();
    }

    public List<String> findGradovi() {
        return em.createQuery("SELECT DISTINCT z.grad FROM Zgrada z WHERE z.grad IS NOT NULL ORDER BY z.grad", String.class)
                .getResultList();
    }

    public List<String> findNaselja(String grad) {
        return em.createQuery("""
                        SELECT DISTINCT z.naselje FROM Zgrada z
                        WHERE z.naselje IS NOT NULL
                          AND (:grad IS NULL OR z.grad = :grad)
                        ORDER BY z.naselje
                        """, String.class)
                .setParameter("grad", grad)
                .getResultList();
    }

    public List<Zgrada> findByNaziv(String naziv) {
        return em.createQuery("SELECT z FROM Zgrada z WHERE z.naziv = :naziv", Zgrada.class)
                .setParameter("naziv", naziv)
                .getResultList();
    }

    public Zgrada findByLocationAndNaziv(String grad, String naselje, String naziv) {
        String normalizedNaselje = normalize(naselje);
        List<Zgrada> result = em.createQuery("""
                        SELECT z FROM Zgrada z
                        WHERE LOWER(z.grad) = LOWER(:grad)
                          AND LOWER(z.naziv) = LOWER(:naziv)
                          AND (
                            (:naselje IS NULL AND (z.naselje IS NULL OR z.naselje = ''))
                            OR (:naselje IS NOT NULL AND LOWER(z.naselje) = LOWER(:naselje))
                          )
                        ORDER BY z.id
                        """, Zgrada.class)
                .setParameter("grad", grad)
                .setParameter("naselje", normalizedNaselje)
                .setParameter("naziv", naziv)
                .setMaxResults(1)
                .getResultList();
        return result.isEmpty() ? null : result.get(0);
    }

    @Transactional
    public Zgrada update(Long id, Zgrada updatedZgrada) {
        Zgrada existing = em.find(Zgrada.class, id);

        if (existing == null) {
            return null;
        }

        existing.setNaziv(updatedZgrada.getNaziv());
        existing.setVlasnik(updatedZgrada.getVlasnik());
        existing.setGrad(updatedZgrada.getGrad());
        existing.setNaselje(updatedZgrada.getNaselje());

        return em.merge(existing);
    }

    @Transactional
    public void delete(Long id) {
        Zgrada zgrada = em.find(Zgrada.class, id);
        if (zgrada != null) {
            em.remove(zgrada);
        }
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

