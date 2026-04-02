package mf.fit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Ulaz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brojUlaza;
    private String brojZiroRacuna;
    private String nazivUlaza;

    @ManyToOne
    @JoinColumn(name = "zgrada_id")
    private Zgrada zgrada;

    public Long getId() {
        return id;
    }

    //GETTERS I SETTERS
    public String getBrojUlaza() {
        return brojUlaza;
    }

    public void setBrojUlaza(String brojUlaza) {
        this.brojUlaza = brojUlaza;
    }

    public String getBrojZiroRacuna() {
        return brojZiroRacuna;
    }

    public void setBrojZiroRacuna(String brojZiroRacuna) {
        this.brojZiroRacuna = brojZiroRacuna;
    }

    public String getNazivUlaza() {
        return nazivUlaza;
    }

    public void setNazivUlaza(String nazivUlaza) {
        this.nazivUlaza = nazivUlaza;
    }

    public Zgrada getZgrada() {
        return zgrada;
    }

    public void setZgrada(Zgrada zgrada) {
        this.zgrada = zgrada;
    }
}