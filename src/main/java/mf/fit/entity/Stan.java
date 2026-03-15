package mf.fit.entity;

import jakarta.persistence.*;

@Entity
public class Stan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public int brojStana;

    @ManyToOne
    public Ulaz ulaz;
}