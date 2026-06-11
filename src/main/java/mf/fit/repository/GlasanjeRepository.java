package mf.fit.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import mf.fit.entity.Glas;
import mf.fit.entity.Glasanje;
import mf.fit.entity.GlasanjeOpcija;

import java.util.List;

@ApplicationScoped
public class GlasanjeRepository {

    @Inject
    EntityManager em;

    public void save(Glasanje glasanje) {
        em.persist(glasanje);
    }

    public void saveVote(Glas glas) {
        if (glas.getId() == null) {
            em.persist(glas);
        } else {
            em.merge(glas);
        }
    }

    public Glasanje findById(Long id) {
        return em.find(Glasanje.class, id);
    }

    public GlasanjeOpcija findOptionById(Long id) {
        return em.find(GlasanjeOpcija.class, id);
    }

    public List<Glasanje> listVisible(Long ulazId) {
        if (ulazId == null) {
            return em.createQuery("SELECT g FROM Glasanje g ORDER BY g.kreiranoAt DESC", Glasanje.class).getResultList();
        }
        return em.createQuery("""
                        SELECT g FROM Glasanje g
                        WHERE g.ulaz IS NULL OR g.ulaz.id = :ulazId
                        ORDER BY g.kreiranoAt DESC
                        """, Glasanje.class)
                .setParameter("ulazId", ulazId)
                .getResultList();
    }

    public Glas findVote(Long glasanjeId, Long stanarId) {
        List<Glas> result = em.createQuery("""
                        SELECT g FROM Glas g
                        WHERE g.glasanje.id = :glasanjeId AND g.stanar.id = :stanarId
                        """, Glas.class)
                .setParameter("glasanjeId", glasanjeId)
                .setParameter("stanarId", stanarId)
                .getResultList();
        return result.isEmpty() ? null : result.get(0);
    }

    public long countVotes(Long optionId) {
        return em.createQuery("SELECT COUNT(g) FROM Glas g WHERE g.opcija.id = :optionId", Long.class)
                .setParameter("optionId", optionId)
                .getSingleResult();
    }
}
