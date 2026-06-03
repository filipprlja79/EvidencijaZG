/*
 * Komentar projekta: JPA entitet koji predstavlja tabelu u bazi i opisuje podatke domena aplikacije.
 */

package mf.fit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity

@NoArgsConstructor
public class Stan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int brojStana;
    private String imeVlasnikaStana;

    @ManyToOne
    @JoinColumn(name = "ulaz_id")
    @JsonIgnoreProperties({"zgrada"})
    private Ulaz ulaz;

    @OneToOne(mappedBy = "stan")
    @JsonIgnoreProperties({"stan"})
    private DetaljiStana detalji;
    public int getBrojStana() {
        return brojStana;
    }

    public void setBrojStana(int brojStana) {
        this.brojStana = brojStana;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImeVlasnikaStana() {
        return imeVlasnikaStana;
    }

    public void setImeVlasnikaStana(String imeVlasnikaStana) {
        this.imeVlasnikaStana = imeVlasnikaStana;
    }

    public Ulaz getUlaz() {
        return ulaz;
    }

    public void setUlaz(Ulaz ulaz) {
        this.ulaz = ulaz;
    }

    public DetaljiStana getDetalji() {
        return detalji;
    }

    public void setDetalji(DetaljiStana detalji) {
        this.detalji = detalji;
    }
}

