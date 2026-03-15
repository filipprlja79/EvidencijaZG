package mf.fit.entity;

import jakarta.persistence.*;

@Entity
public class Stanar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    public long id;
    public String ime;
    public String prezime;
    @ManyToOne
    @JoinColumn(name = "stan_id")
    public Stan stan;
}
