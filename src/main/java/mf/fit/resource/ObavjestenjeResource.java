/*
 * Komentar projekta: REST resource sloj koji definise HTTP endpoint-e dostupne frontend aplikaciji.
 */

package mf.fit.resource;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.StreamingOutput;
import mf.fit.dto.MessageRequest;
import mf.fit.entity.Obavjestenje;
import mf.fit.entity.UploadedFile;
import mf.fit.service.ObavjestenjeService;
import mf.fit.service.UploadedFileService;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/obavjestenja")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ObavjestenjeResource {

    @Inject
    ObavjestenjeService service;

    @Inject
    UploadedFileService uploadedFileService;

    @GET
    @RolesAllowed({"admin", "starjesina"})
    public List<Obavjestenje> getAll() {
        return service.getAll();
    }

    @GET
    @Path("/moje/{stanarId}")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public List<Obavjestenje> getVisibleForStanar(@PathParam("stanarId") Long stanarId) {
        return service.getVisibleForStanar(stanarId);
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public Response getById(@PathParam("id") Long id) {
        // Vraca obavjestenje zajedno sa listom UploadedFile objekata kojima je file popunjen iz filename putanje.
        Obavjestenje o = service.getByIdWithLoadedFiles(id);
        if (o == null) {
            return Response.status(404).entity(msg("Not found")).build();
        }
        return Response.ok(o).build();
    }

    @POST
    @Path("/posalji")
    @RolesAllowed({"admin", "starjesina"})
    public Obavjestenje send(MessageRequest request) {
        return service.send(request);
    }

    @POST
    @RolesAllowed("admin")
    public Response create(Obavjestenje o) {
        service.create(o);
        return Response.status(201).entity(msg("Kreirano")).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("admin")
    public Response update(@PathParam("id") Long id, Obavjestenje o) {
        service.update(id, o);
        return Response.ok(msg("Updated")).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("admin")
    public Response delete(@PathParam("id") Long id) {
        service.delete(id);
        return Response.ok(msg("Deleted")).build();
    }

    @GET
    @Path("/{id}/fajlovi")
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public List<UploadedFile> getFajlovi(@PathParam("id") Long id) {
        // Vraca samo metadata o prilozima za odabrano obavjestenje.
        return uploadedFileService.findByObavjestenjeId(id);
    }

    @POST
    @Path("/fajlovi")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @RolesAllowed({"admin", "starjesina"})
    public Response uploadFajl(@QueryParam("id") Long id,
                               @RestForm("filename") String filename,
                               @RestForm("file") FileUpload file) {
        // Multipart request sadrzi ime fajla i sam fajl; id obavjestenja dolazi kao query parametar.
        UploadedFileService.UploadResult result = uploadedFileService.upload(id, filename, file);
        Response.Status status = result.alreadyExisted() ? Response.Status.OK : Response.Status.CREATED;
        return Response.status(status).entity(result.file()).build();
    }

    @GET
    @Path("/fajlovi/{fajlId}/download")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    @RolesAllowed({"admin", "starjesina", "stanar"})
    public Response downloadFajl(@PathParam("fajlId") Long fajlId) {
        UploadedFile fajl = uploadedFileService.findById(fajlId);
        java.nio.file.Path path = uploadedFileService.resolveStoredPath(fajl);
        // StreamingOutput salje fajl direktno u response bez ucitavanja cijelog fajla u memoriju.
        StreamingOutput stream = output -> Files.copy(path, output);
        String encodedName = URLEncoder.encode(path.getFileName().toString(), StandardCharsets.UTF_8)
                .replace("+", "%20");
        // Content-Disposition govori browseru da preuzme fajl pod originalnim imenom.
        return Response.ok(stream)
                .type(uploadedFileService.probeContentType(path))
                .header("Content-Disposition", "attachment; filename*=UTF-8''" + encodedName)
                .header("Content-Length", path.toFile().length())
                .build();
    }

    @DELETE
    @Path("/fajlovi/{fajlId}")
    @RolesAllowed({"admin", "starjesina"})
    public Response deleteFajl(@PathParam("fajlId") Long fajlId) {
        // Brise metadata zapis i pokusava ukloniti stvarni fajl sa diska.
        uploadedFileService.delete(fajlId);
        return Response.ok(msg("Fajl obrisan")).build();
    }

    private Map<String, String> msg(String tekst) {
        Map<String, String> m = new HashMap<>();
        m.put("message", tekst);
        return m;
    }
}

