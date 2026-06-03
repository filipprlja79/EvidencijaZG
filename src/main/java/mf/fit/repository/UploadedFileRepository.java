/*
 * Komentar projekta: Repository sloj koji centralizuje rad sa bazom preko EntityManager-a.
 */

package mf.fit.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import mf.fit.entity.UploadedFile;

import java.util.List;

@ApplicationScoped
public class UploadedFileRepository {

    @Inject
    EntityManager em;

    public void save(UploadedFile file) {
        em.persist(file);
    }

    public UploadedFile findById(Long id) {
        return em.find(UploadedFile.class, id);
    }

    public UploadedFile findByFilename(String filename) {
        List<UploadedFile> result = em.createQuery("""
                        SELECT f FROM UploadedFile f
                        WHERE f.filename = :filename
                        """, UploadedFile.class)
                .setParameter("filename", filename)
                .getResultList();
        return result.isEmpty() ? null : result.get(0);
    }

    public List<UploadedFile> findByObavjestenjeId(Long obavjestenjeId) {
        return em.createQuery("""
                        SELECT f FROM Obavjestenje o
                        JOIN o.uploadedFiles f
                        WHERE o.id = :obavjestenjeId
                        ORDER BY f.id DESC
                        """, UploadedFile.class)
                .setParameter("obavjestenjeId", obavjestenjeId)
                .getResultList();
    }

    public void delete(UploadedFile file) {
        em.remove(em.contains(file) ? file : em.merge(file));
    }
}
