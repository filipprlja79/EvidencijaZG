/*
 * Komentar projekta: JPA entitet koji predstavlja tabelu u bazi i opisuje podatke domena aplikacije.
 */

package mf.fit.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Obavjestenje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String naslov;
    private String tekst;
    private String tip;
    private LocalDateTime kreiranoAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ulaz_id")
    @JsonIgnoreProperties({"zgrada"})
    private Ulaz ulaz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posiljalac_id")
    @JsonIgnoreProperties({"stan", "timezoneInfos", "currencyResponses", "password"})
    private Stanar posiljalac;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "stanar_obavjestenje",
            joinColumns = @JoinColumn(name = "obavjestenje_id"),
            inverseJoinColumns = @JoinColumn(name = "stanar_id")
    )
    @JsonIgnoreProperties({"stan", "timezoneInfos", "currencyResponses", "password"})
    private List<Stanar> stanari;

    // Trazeni dio zadatka: Obavjestenje kao entitet X ima ManyToMany listu uploadovanih fajlova.
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "obavjestenje_uploaded_file",
            joinColumns = @JoinColumn(name = "obavjestenje_id"),
            inverseJoinColumns = @JoinColumn(name = "uploaded_file_id")
    )
    private List<UploadedFile> uploadedFiles = new ArrayList<>();

    // GETTERS & SETTERS
    public Long getId() { return id; }
    public String getNaslov() { return naslov; }
    public void setNaslov(String naslov) { this.naslov = naslov; }

    public String getTekst() { return tekst; }
    public void setTekst(String tekst) { this.tekst = tekst; }

    public String getTip() { return tip; }
    public void setTip(String tip) { this.tip = tip; }

    public LocalDateTime getKreiranoAt() { return kreiranoAt; }
    public void setKreiranoAt(LocalDateTime kreiranoAt) { this.kreiranoAt = kreiranoAt; }

    public Ulaz getUlaz() { return ulaz; }
    public void setUlaz(Ulaz ulaz) { this.ulaz = ulaz; }

    public Stanar getPosiljalac() { return posiljalac; }
    public void setPosiljalac(Stanar posiljalac) { this.posiljalac = posiljalac; }

    public List<Stanar> getStanari() { return stanari; }
    public void setStanari(List<Stanar> stanari) { this.stanari = stanari; }

    public List<UploadedFile> getUploadedFiles() { return uploadedFiles; }
    public void setUploadedFiles(List<UploadedFile> uploadedFiles) { this.uploadedFiles = uploadedFiles; }
}

