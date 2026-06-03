/*
 * Komentar projekta: Repository sloj koji centralizuje rad sa bazom preko EntityManager-a.
 */

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
        return em.createQuery("SELECT o FROM Obavjestenje o ORDER BY o.kreiranoAt DESC", Obavjestenje.class).getResultList();
    }

    public Obavjestenje findById(Long id) {
        return em.find(Obavjestenje.class, id);
    }

    public List<Obavjestenje> findVisibleForStanar(Long stanarId, Long ulazId) {
        return em.createQuery("""
                        SELECT DISTINCT o FROM Obavjestenje o
                        LEFT JOIN o.stanari s
                        WHERE o.tip = 'GENERAL'
                           OR (o.tip = 'ENTRANCE' AND o.ulaz.id = :ulazId)
                           OR (o.tip = 'PRIVATE' AND s.id = :stanarId)
                        ORDER BY o.kreiranoAt DESC
                        """, Obavjestenje.class)
                .setParameter("stanarId", stanarId)
                .setParameter("ulazId", ulazId)
                .getResultList();
    }

    public List<Obavjestenje> findByUploadedFileId(Long uploadedFileId) {
        return em.createQuery("""
                        SELECT o FROM Obavjestenje o
                        JOIN o.uploadedFiles f
                        WHERE f.id = :uploadedFileId
                        """, Obavjestenje.class)
                .setParameter("uploadedFileId", uploadedFileId)
                .getResultList();
    }

    public void delete(Long id) {
        Obavjestenje o = em.find(Obavjestenje.class, id);
        if (o != null) {
            em.remove(o);
        }
    }
}

