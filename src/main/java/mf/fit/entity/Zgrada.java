package mf.fit.entity;

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

    @OneToMany(mappedBy = "zgrada", fetch = FetchType.LAZY)
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

    public List<Ulaz> getUlazi() {
        return ulazi;
    }

    public void setUlazi(List<Ulaz> ulazi) {
        this.ulazi = ulazi;
    }
}