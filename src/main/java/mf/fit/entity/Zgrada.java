package mf.fit.entity;

import jakarta.persistence.*;

@Entity
public class Zgrada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String naziv;

    public String vlasnik;
}