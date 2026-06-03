/*
 * Komentar projekta: Service sloj koji sadrzi poslovnu logiku i koordinise repository-je, validacije i spoljasnje servise.
 */

package mf.fit.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import mf.fit.entity.Obavjestenje;
import mf.fit.entity.UploadedFile;
import mf.fit.repository.ObavjestenjeRepository;
import mf.fit.repository.UploadedFileRepository;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@ApplicationScoped
public class UploadedFileService {

    public record UploadResult(UploadedFile file, boolean alreadyExisted) {
    }

    // Limit cuva sistem od prevelikih upload-a i dovoljan je za fakture, slike i dokumente.
    private static final long MAX_FILE_SIZE = 10L * 1024L * 1024L;

    // Lista MIME tipova koje aplikacija prihvata kao priloge obavjestenja.
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    @ConfigProperty(name = "app.files.upload-dir", defaultValue = "uploads")
    String uploadDir;

    @Inject
    UploadedFileRepository repository;

    @Inject
    ObavjestenjeRepository obavjestenjeRepository;

    public List<UploadedFile> findByObavjestenjeId(Long obavjestenjeId) {
        // Prvo provjeravamo da obavjestenje postoji da API ne vrati praznu listu za nevalidan ID.
        ensureObavjestenjeExists(obavjestenjeId);
        return repository.findByObavjestenjeId(obavjestenjeId);
    }

    public UploadedFile findById(Long id) {
        UploadedFile file = repository.findById(id);
        if (file == null) {
            throw new WebApplicationException("Fajl nije pronadjen", 404);
        }
        return file;
    }

    public Path resolveStoredPath(UploadedFile file) {
        Path basePath = Path.of(uploadDir, "obavjestenja").toAbsolutePath().normalize();
        Path storedPath = Path.of(file.getFilename()).isAbsolute()
                ? Path.of(file.getFilename()).normalize()
                : basePath.resolve(file.getFilename()).normalize();
        // Sigurnosna provjera sprjecava citanje fajlova van dozvoljenog upload foldera.
        if (!storedPath.startsWith(basePath)) {
            throw new WebApplicationException("Neispravna putanja fajla", 400);
        }
        if (!Files.exists(storedPath)) {
            throw new WebApplicationException("Fajl ne postoji na disku", 404);
        }
        return storedPath;
    }

    public String probeContentType(Path path) {
        try {
            String contentType = Files.probeContentType(path);
            return contentType == null ? "application/octet-stream" : contentType;
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }

    @Transactional
    public UploadResult upload(Long obavjestenjeId, String requestedFilename, FileUpload upload) {
        // Multipart forma mora poslati dio pod imenom "file".
        if (upload == null || upload.uploadedFile() == null) {
            throw new WebApplicationException("Fajl je obavezan", 400);
        }

        Obavjestenje obavjestenje = ensureObavjestenjeExists(obavjestenjeId);
        validateContentType(normalizeContentType(upload.contentType()));

        try {
            // Validacija velicine se radi prije snimanja u trajni folder.
            long size = Files.size(upload.uploadedFile());
            if (size <= 0) {
                throw new WebApplicationException("Fajl ne smije biti prazan", 400);
            }
            if (size > MAX_FILE_SIZE) {
                throw new WebApplicationException("Maksimalna velicina fajla je 10 MB", 400);
            }

            String storedName = sanitizeFileName(firstPresent(requestedFilename, upload.fileName()));
            Path targetDirectory = Path.of(uploadDir, "obavjestenja").toAbsolutePath().normalize();
            Files.createDirectories(targetDirectory);

            Path targetPath = targetDirectory.resolve(storedName).normalize();
            // Dodatna provjera sprjecava path traversal kroz manipulaciju imenom fajla.
            if (!targetPath.startsWith(targetDirectory)) {
                throw new WebApplicationException("Neispravno ime fajla", 400);
            }

            boolean alreadyExisted = Files.exists(targetPath);
            if (!alreadyExisted) {
                Files.copy(upload.uploadedFile(), targetPath);
            }

            // Po zahtjevu, u varijabli filename cuvamo putanju do fajla na filesystem-u.
            String storedPath = targetPath.toString();
            UploadedFile file = repository.findByFilename(storedPath);
            if (file == null) {
                file = new UploadedFile();
                file.setFilename(storedPath);
                file.setFile(targetPath.toFile());
                repository.save(file);
            }

            if (obavjestenje.getUploadedFiles() == null) {
                obavjestenje.setUploadedFiles(new ArrayList<>());
            }
            Long uploadedFileId = file.getId();
            boolean alreadyLinked = obavjestenje.getUploadedFiles().stream()
                    .anyMatch(existing -> existing.getId() != null && existing.getId().equals(uploadedFileId));
            if (!alreadyLinked) {
                // Obavjestenje je managed entitet; promjena liste radi update join tabele.
                obavjestenje.getUploadedFiles().add(file);
            }
            return new UploadResult(file, alreadyExisted);
        } catch (IOException e) {
            throw new WebApplicationException("Fajl nije sacuvan", e, 500);
        }
    }

    @Transactional
    public void delete(Long fileId) {
        UploadedFile file = findById(fileId);
        Path path = resolveStoredPath(file);
        // ManyToMany veza se prvo cisti da join tabela ne ostane vezana za obrisan fajl.
        List<Obavjestenje> linkedNotifications = obavjestenjeRepository.findByUploadedFileId(fileId);
        linkedNotifications.forEach(obavjestenje -> obavjestenje.getUploadedFiles().remove(file));
        repository.delete(file);
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new WebApplicationException("Zapis je obrisan, ali fajl nije uklonjen sa diska", e, 500);
        }
    }

    private Obavjestenje ensureObavjestenjeExists(Long obavjestenjeId) {
        Obavjestenje obavjestenje = obavjestenjeRepository.findById(obavjestenjeId);
        if (obavjestenje == null) {
            throw new WebApplicationException("Obavjestenje nije pronadjeno", 404);
        }
        return obavjestenje;
    }

    private void validateContentType(String contentType) {
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new WebApplicationException("Dozvoljeni su PDF, PNG, JPG, DOC i DOCX fajlovi", 400);
        }
    }

    private String normalizeContentType(String contentType) {
        return contentType == null ? "" : contentType.toLowerCase(Locale.ROOT).trim();
    }

    private String sanitizeFileName(String fileName) {
        String source = fileName == null || fileName.isBlank() ? "fajl" : Path.of(fileName).getFileName().toString();
        // Uklanja specijalne karaktere i dijakritiku da ime fajla bude sigurno za filesystem.
        String normalized = Normalizer.normalize(source, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^a-zA-Z0-9._-]", "-")
                .replaceAll("-+", "-");
        return normalized.isBlank() ? "fajl" : normalized;
    }

    private String firstPresent(String primary, String fallback) {
        return primary == null || primary.isBlank() ? fallback : primary;
    }
}
