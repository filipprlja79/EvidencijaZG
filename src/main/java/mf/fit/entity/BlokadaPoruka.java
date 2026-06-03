/*
 * Komentar projekta: JPA entitet koji predstavlja tabelu u bazi i opisuje podatke domena aplikacije.
 */

package mf.fit.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(name = "uk_blokada_stanara", columnNames = {"blokirao_id", "blokirani_id"})
})
public class BlokadaPoruka {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blokirao_id", nullable = false)
    @JsonIgnoreProperties({"stan", "timezoneInfos", "currencyResponses", "password"})
    private Stanar blokirao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blokirani_id", nullable = false)
    @JsonIgnoreProperties({"stan", "timezoneInfos", "currencyResponses", "password"})
    private Stanar blokirani;

    private LocalDateTime kreiranoAt;

    public Long getId() {
        return id;
    }

    public Stanar getBlokirao() {
        return blokirao;
    }

    public void setBlokirao(Stanar blokirao) {
        this.blokirao = blokirao;
    }

    public Stanar getBlokirani() {
        return blokirani;
    }

    public void setBlokirani(Stanar blokirani) {
        this.blokirani = blokirani;
    }

    public LocalDateTime getKreiranoAt() {
        return kreiranoAt;
    }

    public void setKreiranoAt(LocalDateTime kreiranoAt) {
        this.kreiranoAt = kreiranoAt;
    }
}

