package mf.fit.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import mf.fit.entity.BlokadaPoruka;

import java.util.List;

@ApplicationScoped
public class BlokadaPorukaRepository {

    @Inject
    EntityManager em;

    public List<BlokadaPoruka> findByBlokirao(Long stanarId) {
        return em.createQuery("""
                        SELECT b FROM BlokadaPoruka b
                        WHERE b.blokirao.id = :stanarId
                        ORDER BY b.kreiranoAt DESC
                        """, BlokadaPoruka.class)
                .setParameter("stanarId", stanarId)
                .getResultList();
    }

    public boolean exists(Long blokiraoId, Long blokiraniId) {
        Long count = em.createQuery("""
                        SELECT COUNT(b) FROM BlokadaPoruka b
                        WHERE b.blokirao.id = :blokiraoId
                          AND b.blokirani.id = :blokiraniId
                        """, Long.class)
                .setParameter("blokiraoId", blokiraoId)
                .setParameter("blokiraniId", blokiraniId)
                .getSingleResult();
        return count > 0;
    }

    @Transactional
    public void save(BlokadaPoruka blokada) {
        em.persist(blokada);
    }

    @Transactional
    public void delete(Long blokiraoId, Long blokiraniId) {
        em.createQuery("""
                        DELETE FROM BlokadaPoruka b
                        WHERE b.blokirao.id = :blokiraoId
                          AND b.blokirani.id = :blokiraniId
                        """)
                .setParameter("blokiraoId", blokiraoId)
                .setParameter("blokiraniId", blokiraniId)
                .executeUpdate();
    }
}
