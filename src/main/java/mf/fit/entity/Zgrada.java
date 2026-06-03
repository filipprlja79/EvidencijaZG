/*
 * Komentar projekta: JPA entitet koji predstavlja tabelu u bazi i opisuje podatke domena aplikacije.
 */

package mf.fit.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Zgrada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String naziv;
    private String vlasnik;
    private String grad;
    private String naselje;

    @OneToMany(mappedBy = "zgrada", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Ulaz> ulazi;

    public Long getId() {
        return id;
    }

    public String getNaziv() {
        return naziv;
    }

    public void setNaziv(String naziv) {
        this.naziv = naziv;
    }

    public String getVlasnik() {
        return vlasnik;
    }

    public void setVlasnik(String vlasnik) {
        this.vlasnik = vlasnik;
    }

    public String getGrad() {
        return grad;
    }

    public void setGrad(String grad) {
        this.grad = grad;
    }

    public String getNaselje() {
        return naselje;
    }

    public void setNaselje(String naselje) {
        this.naselje = naselje;
    }

    public List<Ulaz> getUlazi() {
        return ulazi;
    }

    public void setUlazi(List<Ulaz> ulazi) {
        this.ulazi = ulazi;
    }
}

