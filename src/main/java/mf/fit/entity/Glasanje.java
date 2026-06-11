/*
 * Komentar projekta: JPA entitet za online glasanja unutar ulaza ili cijele zgrade.
 */

package mf.fit.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Glasanje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String naslov;
    private String pitanje;
    private LocalDateTime kreiranoAt;
    private boolean aktivno = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ulaz_id")
    @JsonIgnoreProperties({"zgrada"})
    private Ulaz ulaz;

    @OneToMany(mappedBy = "glasanje", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GlasanjeOpcija> opcije = new ArrayList<>();

    public Long getId() { return id; }
    public String getNaslov() { return naslov; }
    public void setNaslov(String naslov) { this.naslov = naslov; }
    public String getPitanje() { return pitanje; }
    public void setPitanje(String pitanje) { this.pitanje = pitanje; }
    public LocalDateTime getKreiranoAt() { return kreiranoAt; }
    public void setKreiranoAt(LocalDateTime kreiranoAt) { this.kreiranoAt = kreiranoAt; }
    public boolean isAktivno() { return aktivno; }
    public void setAktivno(boolean aktivno) { this.aktivno = aktivno; }
    public Ulaz getUlaz() { return ulaz; }
    public void setUlaz(Ulaz ulaz) { this.ulaz = ulaz; }
    public List<GlasanjeOpcija> getOpcije() { return opcije; }
    public void setOpcije(List<GlasanjeOpcija> opcije) { this.opcije = opcije; }
}
