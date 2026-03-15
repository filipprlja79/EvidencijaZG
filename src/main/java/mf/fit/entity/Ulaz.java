package mf.fit.entity;

import jakarta.persistence.*;

@Entity
public class Ulaz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String brojUlaza;

    @ManyToOne
    public Zgrada zgrada;
}