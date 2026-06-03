/*
 * Komentar projekta: Service sloj koji sadrzi poslovnu logiku i koordinise repository-je, validacije i spoljasnje servise.
 */

package mf.fit.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import mf.fit.entity.BlokadaPoruka;
import mf.fit.entity.Stanar;
import mf.fit.repository.BlokadaPorukaRepository;
import mf.fit.repository.StanarRepository;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class BlokadaPorukaService {

    @Inject
    BlokadaPorukaRepository repository;

    @Inject
    StanarRepository stanarRepository;

    public List<BlokadaPoruka> listFor(Long stanarId) {
        return repository.findByBlokirao(stanarId);
    }

    public boolean isBlocked(Long senderId, Long receiverId) {
        if (senderId == null || receiverId == null) {
            return false;
        }
        return repository.exists(receiverId, senderId);
    }

    @Transactional
    public BlokadaPoruka block(Long stanarId, Long blockedStanarId) {
        if (stanarId.equals(blockedStanarId)) {
            throw new WebApplicationException("Ne mozete blokirati svoj nalog", 400);
        }
        if (repository.exists(stanarId, blockedStanarId)) {
            throw new WebApplicationException("Stanar je vec blokiran", 409);
        }

        Stanar blokirao = stanarRepository.findById(stanarId);
        Stanar blokirani = stanarRepository.findById(blockedStanarId);
        if (blokirao == null || blokirani == null) {
            throw new WebApplicationException("Stanar nije pronadjen", 404);
        }

        BlokadaPoruka blokada = new BlokadaPoruka();
        blokada.setBlokirao(blokirao);
        blokada.setBlokirani(blokirani);
        blokada.setKreiranoAt(LocalDateTime.now());
        repository.save(blokada);
        return blokada;
    }

    @Transactional
    public void unblock(Long stanarId, Long blockedStanarId) {
        repository.delete(stanarId, blockedStanarId);
    }
}

