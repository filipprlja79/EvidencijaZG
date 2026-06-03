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

    public Stanar findByEmail(String email) {
        List<Stanar> result = em.createQuery("SELECT s FROM Stanar s WHERE LOWER(s.email) = LOWER(:email)", Stanar.class)
                .setParameter("email", email)
                .getResultList();
        return result.isEmpty() ? null : result.get(0);
    }

    public Stanar findByUsername(String username) {
        List<Stanar> result = em.createQuery("SELECT s FROM Stanar s WHERE s.username = :username", Stanar.class)
                .setParameter("username", username)
                .getResultList();
        return result.isEmpty() ? null : result.get(0);
    }

    public Stanar findByKeycloakId(String keycloakId) {
        List<Stanar> result = em.createQuery("SELECT s FROM Stanar s WHERE s.keycloakId = :keycloakId", Stanar.class)
                .setParameter("keycloakId", keycloakId)
                .getResultList();
        return result.isEmpty() ? null : result.get(0);
    }

    public List<Stanar> findByUlazId(Long ulazId) {
        return em.createQuery("SELECT s FROM Stanar s WHERE s.stan.ulaz.id = :ulazId ORDER BY s.prezime, s.ime", Stanar.class)
                .setParameter("ulazId", ulazId)
                .getResultList();
    }

    public Stanar findStarjesinaByUlazId(Long ulazId) {
        List<Stanar> result = em.createQuery("""
                        SELECT s FROM Stanar s
                        WHERE s.stan.ulaz.id = :ulazId
                          AND s.tipNaloga = 2
                        """, Stanar.class)
                .setParameter("ulazId", ulazId)
                .getResultList();
        return result.isEmpty() ? null : result.get(0);
    }


    // UPDATE
    @Transactional
    public Stanar update(Long id, Stanar updatedStanar) {
        Stanar existing = em.find(Stanar.class, id);

        if (existing == null) {
            return null;
        }

        existing.setIme(updatedStanar.getIme());
        existing.setPrezime(updatedStanar.getPrezime());
        existing.setBrTelefona(updatedStanar.getBrTelefona());
        existing.setUsername(updatedStanar.getUsername());
        if (updatedStanar.getPassword() != null && !updatedStanar.getPassword().isBlank()) {
            existing.setPassword(updatedStanar.getPassword());
        }
        if (updatedStanar.getEmail() != null && !updatedStanar.getEmail().isBlank()) {
            existing.setEmail(updatedStanar.getEmail());
            existing.setUsername(updatedStanar.getEmail());
        }
        if (updatedStanar.getKeycloakId() != null && !updatedStanar.getKeycloakId().isBlank()) {
            existing.setKeycloakId(updatedStanar.getKeycloakId());
        }
        if (updatedStanar.getTipNaloga() != null) {
            existing.setTipNaloga(updatedStanar.getTipNaloga());
            existing.setStarjesina(updatedStanar.getTipNaloga() == 2);
        } else {
            existing.setStarjesina(updatedStanar.getStarjesina());
        }
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
