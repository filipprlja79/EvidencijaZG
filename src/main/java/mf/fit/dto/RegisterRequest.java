/*
 * Komentar projekta: DTO objekat koji prenosi podatke izmedju frontend-a i backend-a bez direktnog izlaganja kompletnih entiteta.
 */

package mf.fit.dto;

public record RegisterRequest(
        String email,
        String password,
        Integer roleCode,
        String ime,
        String prezime,
        String brTelefona,
        Long zgradaId,
        Long ulazId,
        Long stanId,
        String grad,
        String naselje,
        String zgradaNaziv,
        String zgradaVlasnik,
        String brojUlaza,
        String nazivUlaza,
        String brojZiroRacuna,
        Integer brojStana,
        String imeVlasnikaStana
) {
}

