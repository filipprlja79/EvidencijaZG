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

    public List<Zgrada> findByNaziv(String naziv) {
        return em.createQuery("SELECT z FROM Zgrada z WHERE z.naziv = :naziv", Zgrada.class)
                .setParameter("naziv", naziv)
                .getResultList();
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