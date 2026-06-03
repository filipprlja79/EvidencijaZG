/*
 * Komentar projekta: Repository sloj koji centralizuje rad sa bazom preko EntityManager-a.
 */

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

    public List<Ulaz> findByZgradaId(Long zgradaId) {
        return em.createQuery("SELECT u FROM Ulaz u WHERE u.zgrada.id = :zgradaId ORDER BY u.brojUlaza", Ulaz.class)
                .setParameter("zgradaId", zgradaId)
                .getResultList();
    }

    public Ulaz findByZgradaAndIdentifier(Long zgradaId, String brojUlaza, String nazivUlaza) {
        String normalizedBroj = normalize(brojUlaza);
        String normalizedNaziv = normalize(nazivUlaza);
        if (zgradaId == null || (normalizedBroj == null && normalizedNaziv == null)) {
            return null;
        }

        List<Ulaz> result = em.createQuery("""
                        SELECT u FROM Ulaz u
                        WHERE u.zgrada.id = :zgradaId
                          AND (
                            (:brojUlaza IS NOT NULL AND LOWER(u.brojUlaza) = LOWER(:brojUlaza))
                            OR (:nazivUlaza IS NOT NULL AND LOWER(u.nazivUlaza) = LOWER(:nazivUlaza))
                          )
                        ORDER BY u.id
                        """, Ulaz.class)
                .setParameter("zgradaId", zgradaId)
                .setParameter("brojUlaza", normalizedBroj)
                .setParameter("nazivUlaza", normalizedNaziv)
                .setMaxResults(1)
                .getResultList();
        return result.isEmpty() ? null : result.get(0);
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

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

