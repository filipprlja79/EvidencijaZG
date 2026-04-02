package mf.fit.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Obavjestenje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String naslov;
    private String tekst;

    @ManyToMany
    @JoinTable(
            name = "stanar_obavjestenje",
            joinColumns = @JoinColumn(name = "obavjestenje_id"),
            inverseJoinColumns = @JoinColumn(name = "stanar_id")
    )
    private List<Stanar> stanari;

    // GETTERS & SETTERS
    public Long getId() { return id; }
    public String getNaslov() { return naslov; }
    public void setNaslov(String naslov) { this.naslov = naslov; }

    public String getTekst() { return tekst; }
    public void setTekst(String tekst) { this.tekst = tekst; }

    public List<Stanar> getStanari() { return stanari; }
    public void setStanari(List<Stanar> stanari) { this.stanari = stanari; }
}