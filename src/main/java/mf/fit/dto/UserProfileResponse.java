package mf.fit.dto;

public record UserProfileResponse(
        Long id,
        String keycloakId,
        String email,
        String ime,
        String prezime,
        String brTelefona,
        Integer roleCode,
        String role,
        Long zgradaId,
        String zgradaNaziv,
        String grad,
        String naselje,
        Long ulazId,
        String ulazNaziv,
        String brojUlaza,
        Long stanId,
        Integer brojStana
) {
}
