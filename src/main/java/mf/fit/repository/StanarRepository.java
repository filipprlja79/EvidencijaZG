package mf.fit.repository;

import mf.fit.entity.Stanar;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class StanarRepository {

    @Inject
    EntityManager em;

    @Transactional
    public void save(Stanar stanar) {
        em.persist(stanar);
    }

    public List<Stanar> findAll() {
        return em.createQuery("from Stanar", Stanar.class).getResultList();
    }

    public Stanar findById(Long id) {
        return em.find(Stanar.class, id);
    }


    // UPDATE
    @Transactional
    public Stanar update(Long id, Stanar updatedStanar) {
        Stanar existing = em.find(Stanar.class, id);

        if (existing == null) {
            return null; // možeš i baciti exception
        }

        // update svih polja
        existing.setIme(updatedStanar.getIme());
        existing.setPrezime(updatedStanar.getPrezime());
        existing.setBrTelefona(updatedStanar.getBrTelefona());
        existing.setUsername(updatedStanar.getUsername());
        existing.setPassword(updatedStanar.getPassword());
        existing.setStarjesina(updatedStanar.getStarjesina());
        existing.setStan(updatedStanar.getStan());

        return em.merge(existing);
    }

    @Transactional
    public void delete(Long id) {
        Stanar s = em.find(Stanar.class, id);
        if (s != null) {
            em.remove(s);
        }
    }


}