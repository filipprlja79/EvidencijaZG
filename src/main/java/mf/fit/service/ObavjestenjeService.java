/*
 * Komentar projekta: Service sloj koji sadrzi poslovnu logiku i koordinise repository-je, validacije i spoljasnje servise.
 */

package mf.fit.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import mf.fit.dto.MessageRequest;
import mf.fit.entity.Obavjestenje;
import mf.fit.entity.Stanar;
import mf.fit.entity.UploadedFile;
import mf.fit.entity.Ulaz;
import mf.fit.repository.ObavjestenjeRepository;
import mf.fit.repository.StanarRepository;
import mf.fit.repository.UlazRepository;

import java.time.LocalDateTime;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class ObavjestenjeService {

    @Inject
    ObavjestenjeRepository repository;

    @Inject
    StanarRepository stanarRepository;

    @Inject
    UlazRepository ulazRepository;

    @Inject
    BlokadaPorukaService blokadaPorukaService;

    @Inject
    EmailNotificationService emailNotificationService;

    public List<Obavjestenje> getAll() {
        return repository.list();
    }

    public List<Obavjestenje> getVisibleForStanar(Long stanarId) {
        Stanar stanar = stanarRepository.findById(stanarId);
        if (stanar == null || stanar.getStan() == null || stanar.getStan().getUlaz() == null) {
            throw new WebApplicationException("Stanar nije pronadjen ili nije vezan za ulaz", 404);
        }
        return repository.findVisibleForStanar(stanarId, stanar.getStan().getUlaz().getId());
    }

    public Obavjestenje getById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Obavjestenje getByIdWithLoadedFiles(Long id) {
        Obavjestenje obavjestenje = repository.findById(id);
        if (obavjestenje == null) {
            return null;
        }

        // Ucitavamo ManyToMany listu dok je entitet jos u transakciji.
        List<UploadedFile> uploadedFiles = obavjestenje.getUploadedFiles();
        uploadedFiles.size();
        if (obavjestenje.getStanari() != null) {
            obavjestenje.getStanari().size();
        }

        // Za svaki UploadedFile pravimo File objekat iz putanje sacuvane u filename.
        for (UploadedFile uploadedFile : uploadedFiles) {
            if (uploadedFile.getFilename() != null && !uploadedFile.getFilename().isBlank()) {
                uploadedFile.setFile(new File(uploadedFile.getFilename()));
            }
        }
        return obavjestenje;
    }

    @Transactional
    public Obavjestenje send(MessageRequest request) {
        validateMessage(request);

        String type = request.tip().trim().toUpperCase();
        Stanar sender = request.senderId() == null ? null : stanarRepository.findById(request.senderId());
        List<Stanar> recipients = resolveRecipients(request, type, sender);

        Obavjestenje notification = new Obavjestenje();
        notification.setNaslov(request.naslov().trim());
        notification.setTekst(request.tekst().trim());
        notification.setTip(type);
        notification.setKreiranoAt(LocalDateTime.now());
        notification.setPosiljalac(sender);
        notification.setStanari(recipients);

        if ("ENTRANCE".equals(type)) {
            notification.setUlaz(resolveUlaz(request.ulazId()));
        }

        repository.save(notification);
        recipients.forEach(recipient -> emailNotificationService.sendNotification(
                recipient,
                notification.getNaslov(),
                notification.getTekst()
        ));
        return notification;
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
        if (o.getTip() == null || o.getTip().isBlank()) {
            o.setTip("PRIVATE");
        }
        if (o.getKreiranoAt() == null) {
            o.setKreiranoAt(LocalDateTime.now());
        }

        repository.save(o);
    }

    @Transactional
    public void update(Long id, Obavjestenje novi) {
        Obavjestenje o = repository.findById(id);

        if (o != null) {
            o.setNaslov(novi.getNaslov());
            o.setTekst(novi.getTekst());
            o.setTip(novi.getTip());
            o.setUlaz(novi.getUlaz());

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

    private void validateMessage(MessageRequest request) {
        if (request == null || request.naslov() == null || request.naslov().isBlank()) {
            throw new WebApplicationException("Naslov je obavezan", 400);
        }
        if (request.tekst() == null || request.tekst().isBlank()) {
            throw new WebApplicationException("Tekst poruke je obavezan", 400);
        }
        if (request.tip() == null || request.tip().isBlank()) {
            throw new WebApplicationException("Tip poruke je obavezan", 400);
        }
        String type = request.tip().trim().toUpperCase();
        if (!List.of("PRIVATE", "ENTRANCE", "GENERAL").contains(type)) {
            throw new WebApplicationException("Tip poruke mora biti PRIVATE, ENTRANCE ili GENERAL", 400);
        }
        if ("PRIVATE".equals(type) && (request.stanarIds() == null || request.stanarIds().isEmpty())) {
            throw new WebApplicationException("Privatna poruka mora imati makar jednog primaoca", 400);
        }
        if ("ENTRANCE".equals(type) && request.ulazId() == null) {
            throw new WebApplicationException("Poruka za ulaz mora imati ulaz", 400);
        }
    }

    private List<Stanar> resolveRecipients(MessageRequest request, String type, Stanar sender) {
        if ("GENERAL".equals(type)) {
            return stanarRepository.findAll();
        }

        if ("ENTRANCE".equals(type)) {
            return stanarRepository.findByUlazId(request.ulazId());
        }

        List<Stanar> recipients = new ArrayList<>();
        for (Long stanarId : request.stanarIds()) {
            Stanar recipient = stanarRepository.findById(stanarId);
            if (recipient != null && !blokadaPorukaService.isBlocked(sender == null ? null : sender.getId(), recipient.getId())) {
                recipients.add(recipient);
            }
        }
        return recipients;
    }

    private Ulaz resolveUlaz(Long ulazId) {
        Ulaz ulaz = ulazRepository.findById(ulazId);
        if (ulaz == null) {
            throw new WebApplicationException("Ulaz nije pronadjen", 404);
        }
        return ulaz;
    }
}

