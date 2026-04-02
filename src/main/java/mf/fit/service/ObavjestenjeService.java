package mf.fit.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import mf.fit.entity.Obavjestenje;
import mf.fit.entity.Stanar;
import mf.fit.repository.ObavjestenjeRepository;
import mf.fit.repository.StanarRepository;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class ObavjestenjeService {

    @Inject
    ObavjestenjeRepository repository;

    @Inject
    StanarRepository stanarRepository;

    public List<Obavjestenje> getAll() {
        return repository.list();
    }

    public Obavjestenje getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public void create(Obavjestenje o) {

        List<Stanar> praviStanari = new ArrayList<>();

        if (o.getStanari() != null) {
            for (Stanar s : o.getStanari()) {
                Stanar izBaze = stanarRepository.findById(s.getId());
                if (izBaze != null) {
                    praviStanari.add(izBaze);
                }
            }
        }

        o.setStanari(praviStanari);

        repository.save(o);
    }

    @Transactional
    public void update(Long id, Obavjestenje novi) {

        Obavjestenje o = repository.findById(id);

        if (o != null) {

            // 🔹 obična polja
            o.setNaslov(novi.getNaslov());
            o.setTekst(novi.getTekst());

            // 🔥 RELACIJA UPDATE
            List<Stanar> noviStanari = new ArrayList<>();

            if (novi.getStanari() != null) {
                for (Stanar s : novi.getStanari()) {
                    Stanar izBaze = stanarRepository.findById(s.getId());
                    if (izBaze != null) {
                        noviStanari.add(izBaze);
                    }
                }
            }

            o.setStanari(noviStanari);
        }
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(id);
    }
}