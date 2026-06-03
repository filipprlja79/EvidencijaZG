package mf.fit.service;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import mf.fit.entity.DetaljiStana;
import mf.fit.entity.Stan;
import mf.fit.entity.Stanar;
import mf.fit.entity.Ulaz;
import mf.fit.entity.Zgrada;
import mf.fit.repository.DetaljiStanaRepository;
import mf.fit.repository.StanRepository;
import mf.fit.repository.StanarRepository;
import mf.fit.repository.UlazRepository;
import mf.fit.repository.ZgradaRepository;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class DemoDataInitializer {

    public static final String ADMIN_EMAIL = "admin@mojazgrada.local";
    public static final String STARJESINA_EMAIL = "starjesina@mojazgrada.local";
    public static final String STANAR_EMAIL = "stanar@mojazgrada.local";

    @Inject
    ZgradaRepository zgradaRepository;

    @Inject
    UlazRepository ulazRepository;

    @Inject
    StanRepository stanRepository;

    @Inject
    StanarRepository stanarRepository;

    @Inject
    DetaljiStanaRepository detaljiStanaRepository;

    @Inject
    DemoPasswordService passwordService;

    @ConfigProperty(name = "app.auth.demo-login.enabled", defaultValue = "true")
    boolean demoLoginEnabled;

    @ConfigProperty(name = "app.auth.demo-password", defaultValue = "Demo12345!")
    String demoPassword;

    @Transactional
    void onStart(@Observes StartupEvent event) {
        if (demoLoginEnabled) {
            seed();
        }
    }

    void seed() {
        Zgrada zgrada = ensureZgrada();
        Ulaz ulaz = ensureUlaz(zgrada);
        Stan stanStarjesine = ensureStan(ulaz, 1, "Starjesina ulaza");
        Stan stanStanara = ensureStan(ulaz, 2, "Demo stanar");
        ensureDetalji(stanStarjesine, 58.4, 2);
        ensureDetalji(stanStanara, 66.0, 3);

        ensureUser(ADMIN_EMAIL, "admin", "Admin", "Demo", "", 99, false, null);
        ensureUser(STARJESINA_EMAIL, "starjesina", "Marko", "Starjesina", "+382 67 100 200", 2, true, stanStarjesine);
        ensureUser(STANAR_EMAIL, "stanar", "Ana", "Stanar", "+382 67 300 400", 1, false, stanStanara);
    }

    private Zgrada ensureZgrada() {
        return zgradaRepository.findAll().stream()
                .filter(z -> "Demo zgrada".equals(z.getNaziv()))
                .findFirst()
                .orElseGet(() -> {
                    Zgrada zgrada = new Zgrada();
                    zgrada.setNaziv("Demo zgrada");
                    zgrada.setVlasnik("Moja Zgrada");
                    zgrada.setGrad("Podgorica");
                    zgrada.setNaselje("Preko Morace");
                    zgradaRepository.save(zgrada);
                    return zgrada;
                });
    }

    private Ulaz ensureUlaz(Zgrada zgrada) {
        return ulazRepository.findByZgradaId(zgrada.getId()).stream()
                .filter(u -> "Demo ulaz".equals(u.getNazivUlaza()))
                .findFirst()
                .orElseGet(() -> {
                    Ulaz ulaz = new Ulaz();
                    ulaz.setBrojUlaza("A");
                    ulaz.setNazivUlaza("Demo ulaz");
                    ulaz.setBrojZiroRacuna("510-000000000000-00");
                    ulaz.setZgrada(zgrada);
                    ulazRepository.save(ulaz);
                    return ulaz;
                });
    }

    private Stan ensureStan(Ulaz ulaz, int brojStana, String vlasnik) {
        return stanRepository.findByUlazId(ulaz.getId()).stream()
                .filter(s -> s.getBrojStana() == brojStana)
                .findFirst()
                .orElseGet(() -> {
                    Stan stan = new Stan();
                    stan.setBrojStana(brojStana);
                    stan.setImeVlasnikaStana(vlasnik);
                    stan.setUlaz(ulaz);
                    stanRepository.save(stan);
                    return stan;
                });
    }

    private void ensureDetalji(Stan stan, double kvadratura, int brojSoba) {
        boolean exists = detaljiStanaRepository.findAll().stream()
                .anyMatch(d -> d.getStan() != null && d.getStan().getId().equals(stan.getId()));
        if (!exists) {
            DetaljiStana detalji = new DetaljiStana();
            detalji.setStan(stan);
            detalji.setKvadratura(kvadratura);
            detalji.setBrojSoba(brojSoba);
            detaljiStanaRepository.save(detalji);
        }
    }

    private void ensureUser(String email, String username, String ime, String prezime, String telefon,
                            int roleCode, boolean starjesina, Stan stan) {
        Stanar existing = stanarRepository.findByEmail(email);
        if (existing == null) {
            Stanar stanar = new Stanar();
            stanar.setEmail(email);
            stanar.setUsername(username);
            stanar.setPassword(passwordService.hash(email, demoPassword));
            stanar.setKeycloakId("demo-" + username);
            stanar.setIme(ime);
            stanar.setPrezime(prezime);
            stanar.setBrTelefona(telefon);
            stanar.setTipNaloga(roleCode);
            stanar.setStarjesina(starjesina);
            stanar.setStan(stan);
            stanarRepository.save(stanar);
            return;
        }

        existing.setUsername(username);
        existing.setPassword(passwordService.hash(email, demoPassword));
        existing.setKeycloakId(existing.getKeycloakId() == null ? "demo-" + username : existing.getKeycloakId());
        existing.setTipNaloga(roleCode);
        existing.setStarjesina(starjesina);
        existing.setStan(stan);
    }
}
