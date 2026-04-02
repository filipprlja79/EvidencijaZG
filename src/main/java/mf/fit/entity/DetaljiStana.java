package mf.fit.entity;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
public class DetaljiStana {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double kvadratura;
    private int brojSoba;

    @OneToOne
    @JoinColumn(name = "stan_id")
    private Stan stan;

    // GETTERI I SETTERI

    public Long getId() {
        return id;
    }

    public double getKvadratura() {
        return kvadratura;
    }

    public void setKvadratura(double kvadratura) {
        this.kvadratura = kvadratura;
    }

    public int getBrojSoba() {
        return brojSoba;
    }

    public void setBrojSoba(int brojSoba) {
        this.brojSoba = brojSoba;
    }

    public Stan getStan() {
        return stan;
    }

    public void setStan(Stan stan) {
        this.stan = stan;
    }
}