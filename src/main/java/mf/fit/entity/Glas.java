/*
 * Komentar projekta: Jedan glas stanara na jednom glasanju.
 */

package mf.fit.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"glasanje_id", "stanar_id"}))
public class Glas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "glasanje_id")
    private Glasanje glasanje;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opcija_id")
    private GlasanjeOpcija opcija;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stanar_id")
    private Stanar stanar;

    private LocalDateTime glasanoAt;

    public Long getId() { return id; }
    public Glasanje getGlasanje() { return glasanje; }
    public void setGlasanje(Glasanje glasanje) { this.glasanje = glasanje; }
    public GlasanjeOpcija getOpcija() { return opcija; }
    public void setOpcija(GlasanjeOpcija opcija) { this.opcija = opcija; }
    public Stanar getStanar() { return stanar; }
    public void setStanar(Stanar stanar) { this.stanar = stanar; }
    public LocalDateTime getGlasanoAt() { return glasanoAt; }
    public void setGlasanoAt(LocalDateTime glasanoAt) { this.glasanoAt = glasanoAt; }
}
